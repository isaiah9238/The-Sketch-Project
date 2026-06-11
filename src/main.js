/**
 * Surveyor-Sketch Main Entry Point
 * Orchestrates initialization, state binding, and tool interaction loops.
 */

import CanvasEngine from './entities/fieldbook/canvasEngine.js';
import AICore from './entities/conveyer_2/aiCore.js';
import { globalState } from './turningFile.js';
import { initConversation } from './ai/conversationEngine.js';

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
            const rad = (az * Math.PI) / 180;
            
            // Ensure the starting point is recorded so the first traverse actually draws a line
            if (globalState.coordinates.length === 0) {
                globalState.coordinates.push({ 
                    x: currentPen.x, 
                    y: currentPen.y, 
                    timestamp: new Date().toISOString() 
                });
            }

            const nextPoint = {
                x: currentPen.x + (dist * Math.sin(rad)),
                y: currentPen.y + (dist * Math.cos(rad)),
                timestamp: new Date().toISOString()
            };

            // Commit change securely to central state tree boundary
            globalState.coordinates.push(nextPoint);
            
            // Sync camera and pen positions inside the viewport instance
            if (canvasEngineInstance) {
                canvasEngineInstance.pen.x = nextPoint.x;
                canvasEngineInstance.pen.y = nextPoint.y;
                canvasEngineInstance.camera.x = nextPoint.x;
                canvasEngineInstance.camera.y = nextPoint.y;
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
            // Send user text strings directly through the AI core parsing framework safely
            const summary = aiCoreInstance.processInput(rawText);
            console.log("🤖 [AI Core Evaluation]:", summary);
            
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