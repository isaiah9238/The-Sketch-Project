/**
 * Surveyor-Sketch Main Entry Point
 * Orchestrates initialization, state binding, and tool interaction loops.
/** @typedef {import('./turningFile.js').ExtractedVector} ExtractedVector */

import CanvasEngine from './entities/fieldbook/canvasEngine.js';
import AICore from './entities/conveyer_2/aiCore.js';
import { globalState } from './turningFile.js';
import { initConversation } from './ai/conversationEngine.js';
import { calculateTraverse } from './entities/fieldbook/coordinateMath.js';

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
        // Expose to window framework for resize hooks if required by the system
        /** @type {any} */ (window).currentCanvasEngine = canvasEngineInstance;
    } else {
        console.error("❌ [System Error] Canvas element '#sketchCanvas' missing from DOM.");
    }

    // 2. Initialize the automated AI processing track
    aiCoreInstance = new AICore();

    // 3. Initialize the Gemini-powered conversation engine (Sketch & Notepad personas)
    // API key is passed in — the AI modules don't know or care where it comes from
    const geminiKey = /** @type {any} */ (import.meta).env.GOOGLE_GENAI_API_KEY;
    initConversation(geminiKey);

    // 3. Setup Runtime UI Listeners
    setupInterfaceControls();
});

/**
 * Attaches operational click triggers to the UI layout safely
 */
function setupInterfaceControls() {
    const btnTraverse = document.getElementById('btn-traverse');
    const inputAz = /** @type {HTMLInputElement | null} */ (document.getElementById('input-az'));
    const inputDist = /** @type {HTMLInputElement | null} */ (document.getElementById('input-dist'));

    if (btnTraverse && inputAz && inputDist) {
        btnTraverse.onclick = () => {
            const az = parseFloat(inputAz.value) || 0;
            const dist = parseFloat(inputDist.value) || 0;
            const currentPen = canvasEngineInstance ? canvasEngineInstance.pen : { x: 0, y: 0 };
                        
            // Ensure the starting point is recorded so the first traverse actually draws a line
            if (globalState.coordinates.length === 0) {
                globalState.coordinates.push({ 
                    x: currentPen.x, 
                    y: currentPen.y, 
                    timestamp: new Date().toISOString() 
                });
            }

            // Securely calculate the next point using your core math engine
            const computedPoint = calculateTraverse(currentPen, az, dist);
            const nextPoint = {
                ...computedPoint,
                timestamp: new Date().toISOString()
            };

            // Commit change securely to central state tree boundary
            globalState.coordinates.push(nextPoint);
            
            // Sync camera and pen positions inside the viewport instance
            if (canvasEngineInstance) {
                canvasEngineInstance.pen.x = nextPoint.x;
                canvasEngineInstance.pen.y = nextPoint.y;
                //canvasEngineInstance.camera.x = nextPoint.x;
                //canvasEngineInstance.camera.y = nextPoint.y;
                canvasEngineInstance.render();
            }
        };
    }

    // 4. Sample Integration Handler for Text-Based Automated Notes Passing
    const btnProcessNote = document.getElementById('btn-process-note');
    const txtAreaNote = /** @type {HTMLTextAreaElement | null} */ (document.getElementById('textarea-field-note'));

    if (btnProcessNote && txtAreaNote && aiCoreInstance) {
        btnProcessNote.onclick = () => {
            if (!aiCoreInstance) return;
            const rawText = txtAreaNote.value;
            const summary = /** @type {{ extractedVectors: ExtractedVector[] }} */ (
                aiCoreInstance.processInput(rawText)
            );
            console.log("🤖 [AI Core Evaluation]:", summary);
            
            // Loop through any parsed vectors from the AI Core and physically draw them!
            if (summary.extractedVectors && summary.extractedVectors.length > 0) {
                let currentPen = canvasEngineInstance ? canvasEngineInstance.pen : { x: 0, y: 0 };
                
                // Ensure starting point is recorded
                if (globalState.coordinates.length === 0) {
                    globalState.coordinates.push({ 
                        x: currentPen.x, 
                        y: currentPen.y, 
                        timestamp: new Date().toISOString() 
                    });
                }
                
                for (const vector of summary.extractedVectors) {
                    // Use clean coordinateMath vector addition instead of raw sin/cos multipliers
                    const computedPoint = calculateTraverse(currentPen, vector.azimuth, vector.distance);
                    const nextPoint = {
                        ...computedPoint,
                        timestamp: vector.timestamp || new Date().toISOString()
                    };
                    
                    globalState.coordinates.push(nextPoint);
                    
                    if (canvasEngineInstance) {
                        canvasEngineInstance.pen.x = nextPoint.x;
                        canvasEngineInstance.pen.y = nextPoint.y;
                    }
                    
                    currentPen = nextPoint; // update local pointer for next vector in loop
                }
            }

            if (canvasEngineInstance) {
                canvasEngineInstance.render();
            }
        };
    }

    // 5. Shape Morph Trigger
    const btnMorph = document.getElementById('btn-morph');
    if (btnMorph) {
        btnMorph.onclick = () => {
            if (canvasEngineInstance) {
                canvasEngineInstance.startMorph(2500); // 2.5 second animation
            }
        };
    }
}