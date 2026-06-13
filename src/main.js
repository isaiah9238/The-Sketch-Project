/**
 * Surveyor-Sketch Main Entry Point
 * Orchestrates initialization, state binding, and tool interaction loops.
 */
/** @typedef {import('./turningFile.js').ExtractedVector} ExtractedVector */
/** @typedef {import('./turningFile.js').Coordinate} Coordinate */

import CanvasEngine from './entities/fieldbook/canvasEngine.js';
import AICore from './entities/conveyer_2/aiCore.js';
import { globalState, stateManager } from './turningFile.js';
import { initConversation } from './ai/conversationEngine.js';
import { calculateTraverse } from './entities/fieldbook/coordinateMath.js';
import { generateFunnelVertices } from './sequences/tunnel/tunnelDraw.js';
import { db, auth } from './libs/firebase-init.js';
import { collection, onSnapshot, addDoc, getDocs, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { handleGoogleLogin, handleLogout } from './auth/authService.js';
import { onAuthStateChanged } from 'firebase/auth';

// Initialize the core processing modules
/** @type {CanvasEngine | null} */
let canvasEngineInstance = null;
/** @type {AICore | null} */
let aiCoreInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log("⚡ [System Boot] Initializing Surveyor-Sketch Workspace...");

    // 1. Bind to the hardware canvas view layer
    const canvasElement = /** @type {HTMLCanvasElement | null} */ (document.getElementById('sketchCanvas'));
    if (canvasElement) {
        canvasEngineInstance = new CanvasEngine(canvasElement);
        /** @type {any} */ (window).currentCanvasEngine = canvasEngineInstance;
        
        // Connect the visual engine to the central reactive state!
        stateManager.subscribe(() => {
            if (canvasEngineInstance) canvasEngineInstance.render();
        });
    } else {
        console.error("❌ [System Error] Canvas element '#sketchCanvas' missing from DOM.");
    }
    
    // --- SECTION 1.5: Authentication State Management ---
    const btnLogin = document.getElementById('btn-login');
    const btnLogout = document.getElementById('btn-logout');
    const userInfo = document.getElementById('user-info');

    if (btnLogin) {
        btnLogin.onclick = async () => {
            try {
                await handleGoogleLogin();
            } catch (err) {
                console.error("Login attempt failed:", err);
            }
        };
    }
    if (btnLogout) {
        btnLogout.onclick = async () => {
            await handleLogout();
        };
    }

    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("✅ User authenticated:", user.displayName);
            globalState.user = { uid: user.uid, email: user.email, displayName: user.displayName };
            
            if (userInfo) userInfo.textContent = `Logged in: ${user.displayName}`;
            if (btnLogin) btnLogin.style.display = 'none';
            if (btnLogout) btnLogout.style.display = 'block';
        } else {
            console.log("🔒 User logged out");
            globalState.user = null;
            
            if (userInfo) userInfo.textContent = "Not logged in";
            if (btnLogin) btnLogin.style.display = 'block';
            if (btnLogout) btnLogout.style.display = 'none';
        }
    });

    // 2. Initialize the automated AI processing track
    aiCoreInstance = new AICore();

    // 3. Initialize the Gemini-powered conversation engine
    const geminiKey = import.meta.env.GEMINI_API_KEY;
    initConversation(geminiKey);

    // 4. Setup Runtime UI Listeners
    setupInterfaceControls();

    // 5. Connect to Firebase Realtime Sync
    setupFirebaseSync();
});

function setupFirebaseSync() {
    console.log("🔥 [Firebase] Connecting to real-time coordinates stream...");
    const coordsQuery = query(collection(db, "coordinates"), orderBy("timestamp", "asc"));
    
    onSnapshot(coordsQuery, (snapshot) => {
        // ✅ FIXES Errors 1, 2, 3: Explicitly declare the type of the array
        /** @type {Coordinate[]} */
        const coords = [];
        
        snapshot.forEach((doc) => {
            coords.push(/** @type {Coordinate} */ (doc.data()));
        });
        
        // Update local state tree safely. This natively triggers the reactive Proxy and notifies the Canvas Engine!
        globalState.coordinates = coords;
        
        // Sync camera and pen positions inside the viewport instance safely without bracket syntax
        if (canvasEngineInstance && coords.length > 0) {
            const lastCoord = coords[coords.length - 1];
            canvasEngineInstance.pen.x = lastCoord.x;
            canvasEngineInstance.pen.y = lastCoord.y;
        }
    }, (error) => {
        console.error("❌ [Firebase Error] Failed to sync coordinates:", error);
    });
}

/**
 * Derives the absolute azimuth of the most recently computed vector 
 * securely from the synced coordinates state tree.
 * @returns {number|null} The absolute heading in degrees, or null if insufficient points exist.
 */
function getPreviousAzimuth() {
    if (globalState.coordinates.length < 2) return null;
    const p1 = globalState.coordinates[globalState.coordinates.length - 2];
    const p2 = globalState.coordinates[globalState.coordinates.length - 1];
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y; 
    
    if (dx === 0 && dy === 0) return null;
    
    let deg = (Math.atan2(dx, dy) * 180) / Math.PI;
    return deg < 0 ? deg + 360 : deg;
}

/**
 * Attaches operational click triggers to the UI layout safely
 */
function setupInterfaceControls() {
    const btnTraverse = document.getElementById('btn-traverse');
    const inputAz = /** @type {HTMLInputElement | null} */ (document.getElementById('input-az'));
    const inputDist = /** @type {HTMLInputElement | null} */ (document.getElementById('input-dist'));

    if (btnTraverse && inputAz && inputDist) {
        btnTraverse.onclick = async () => {
            const az = parseFloat(inputAz.value) || 0;
            const dist = parseFloat(inputDist.value) || 0;
            
            let currentPen = {
                x: canvasEngineInstance?.pen?.x ?? 0,
                y: canvasEngineInstance?.pen?.y ?? 0
            };
                        
            if (globalState.coordinates.length === 0) {
                await addDoc(collection(db, "coordinates"), { 
                    x: currentPen.x, 
                    y: currentPen.y, 
                    timestamp: new Date().toISOString() 
                }).catch(console.error);
            }

            let currentAzimuth = getPreviousAzimuth();
            let computedAzimuth = az; 
            
            if (currentAzimuth !== null) {
                computedAzimuth = ((currentAzimuth + az) % 360 + 360) % 360;
            }

            const computedPoint = calculateTraverse(currentPen, computedAzimuth, dist);
            const nextPoint = {
                x: computedPoint.x,
                y: computedPoint.y,
                timestamp: new Date(Date.now() + 10).toISOString()
            };

            await addDoc(collection(db, "coordinates"), nextPoint).catch(console.error);
        };
    }

    const btnProcessNote = document.getElementById('btn-process-note');
    const txtAreaNote = /** @type {HTMLTextAreaElement | null} */ (document.getElementById('textarea-field-note'));

    if (btnProcessNote && txtAreaNote && aiCoreInstance) {
        btnProcessNote.onclick = async () => {
            if (!aiCoreInstance) return;
            // 1. Wipe the cloud database clean
            const oldDocs = await getDocs(collection(db, "coordinates"));
            for (const docRef of oldDocs.docs) {
                await deleteDoc(doc(db, "coordinates", docRef.id));
            }
            
            // 2. ✅ Reset the local canvas engine so it starts fresh at center grid
            if (canvasEngineInstance) {
                globalState.coordinates = []; // Clear local state array
                canvasEngineInstance.pen = { x: 0, y: 0 }; // Reset drawing pen anchor
            }
            const rawText = txtAreaNote.value;
            
            // ✅ FIXES Missing Property Errors: Strongly types the processed AI core wrapper output
            /** @type {{ extractedVectors: ExtractedVector[] }} */
            const summary = /** @type {any} */ (aiCoreInstance.processInput(rawText));
            console.log("🤖 [AI Core Evaluation]:", summary);
            
            if (summary && summary.extractedVectors && summary.extractedVectors.length > 0) {
                // 1. Establish an absolute local anchor that background listeners can't touch during execution
                let localTrackingPen = {
                    x: canvasEngineInstance?.pen?.x ?? 0,
                    y: canvasEngineInstance?.pen?.y ?? 0
                };
                
                if (globalState.coordinates.length === 0) {
                    await addDoc(collection(db, "coordinates"), { 
                        x: localTrackingPen.x, 
                        y: localTrackingPen.y, 
                        timestamp: new Date().toISOString() 
                    }).catch(console.error);
                }
                
                let indexOffset = 1; // Start your timestamp spacing clean
                
                // ✅ FIXES Scanner CWE-94 Warnings: Uses safe for...of loop to eliminate bracket notation checks
                for (const vector of summary.extractedVectors) {
                    let computedAzimuth = vector.azimuth; // Use absolute heading directly
                    
                    // 2. Pass the local tracking pen into your calculator instead of currentPen
                    const computedPoint = calculateTraverse(localTrackingPen, computedAzimuth, vector.distance);
                    const timeOffset = new Date(Date.now() + indexOffset * 10);
                    
                    const nextPoint = {
                        x: computedPoint.x,
                        y: computedPoint.y,
                        timestamp: timeOffset.toISOString()
                    };
                    
                    await addDoc(collection(db, "coordinates"), nextPoint).catch(console.error);
                    
                    // 3. Advance the local tracking pen to the new node sequentially
                    localTrackingPen = { x: computedPoint.x, y: computedPoint.y }; 
                    indexOffset++;
                }
                
                // 4. Once the loop finishes, update the global engine pen state exactly once
                if (canvasEngineInstance) {
                    canvasEngineInstance.pen = { x: localTrackingPen.x, y: localTrackingPen.y };
                }
                console.log("✅ All vectors committed cleanly!");
            }
        };
    }

    // --- SECTION 5: Shape Morph Trigger ---
    const btnMorph = document.getElementById('btn-morph');
    if (btnMorph) {
        btnMorph.onclick = () => {
            executeTunnelMorph();
        };
    }

    const btnClear = document.getElementById('btn-clear');
    if (btnClear) {
        btnClear.onclick = async () => {
            console.log("⚠️ [System] Wiping all coordinates from Firebase...");
            const q = query(collection(db, "coordinates"));
            const snapshot = await getDocs(q);
            
            const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);
            
            if (canvasEngineInstance) {
                canvasEngineInstance.pen = { x: 0, y: 0 };
                canvasEngineInstance.morphState.active = false;
                console.log("✅ [System] Data wipe complete!");
            }
        };
    }
}

/**
 * Triggers a secure database update to morph the active canvas space into a funnel structure.
 */
async function executeTunnelMorph() {
    if (!canvasEngineInstance) return;

    // Use the last recorded point in globalState as our anchor point
    const pointsLength = globalState.coordinates.length;
    if (pointsLength === 0) return;
    
    const anchorPoint = {
        x: globalState.coordinates[pointsLength - 1].x,
        y: globalState.coordinates[pointsLength - 1].y
    };

    // 1. Calculate your custom 6-vertex structural funnel array
    const targetVertices = generateFunnelVertices(anchorPoint, 200, 100, 40, 120);
    console.log("📐 [Tunnel Sequence] Funnel morph layout calculated:", targetVertices);
    
    // 2. Commit the new geometric target state tree to Firebase sequentially
    for (let i = 0; i < targetVertices.length; i++) {
        const vertex = targetVertices[i];
        const timeOffset = new Date(Date.now() + i * 10); // Offset timestamps to prevent collision
        
        const nextPoint = {
            x: vertex.x,
            y: vertex.y,
            timestamp: timeOffset.toISOString()
        };
        
        await addDoc(collection(db, "coordinates"), nextPoint).catch(console.error);
    }

    // 3. Fire the local canvas engine interpolation animation with our target data
    canvasEngineInstance.startMorph(2500, targetVertices); 
}