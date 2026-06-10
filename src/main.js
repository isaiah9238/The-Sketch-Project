/**
 * Surveyor-Sketch Main Entry Point
 * Orchestrates initialization, state binding, and tool interaction loops.
 */

import CanvasEngine from './entities/fieldbook/canvasEngine.js';
import AICore from './entities/conveyer_2/aiCore.js';
import { globalState } from './core/stateManager.js';

// Initialize the core processing modules
let canvasEngineInstance = null;
let aiCoreInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log("⚡ [System Boot] Initializing Surveyor-Sketch Workspace...");

    // 1. Bind to the hardware canvas view layer
    const canvasElement = document.getElementById('sketchCanvas');
    if (canvasElement) {
        canvasEngineInstance = new CanvasEngine(canvasElement);
        // Expose to window framework for resize hooks if required by the system
        window.currentCanvasEngine = canvasEngineInstance;
    } else {
        console.error("❌ [System Error] Canvas element '#sketchCanvas' missing from DOM.");
    }

    // 2. Initialize the automated AI processing track
    aiCoreInstance = new AICore();

    // 3. Setup Runtime UI Listeners
    setupInterfaceControls();
});

/**
 * Attaches operational click triggers to the UI layout safely
 */
function setupInterfaceControls() {
    const btnTraverse = document.getElementById('btn-traverse');
    const inputAz = document.getElementById('input-az');
    const inputDist = document.getElementById('input-dist');

    if (btnTraverse && inputAz && inputDist) {
        btnTraverse.onclick = () => {
            const az = parseFloat(inputAz.value) || 0;
            const dist = parseFloat(inputDist.value) || 0;

            // Direct programmatic vector generation safely committed to state
            const currentPen = canvasEngineInstance ? canvasEngineInstance.pen : { x: 0, y: 0 };
            const rad = (az * Math.PI) / 180;
            
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
    const txtAreaNote = document.getElementById('textarea-field-note');

    if (btnProcessNote && txtAreaNote && aiCoreInstance) {
        btnProcessNote.onclick = () => {
            const rawText = txtAreaNote.value;
            // Send user text strings directly through the AI core parsing framework safely
            const summary = aiCoreInstance.processInput(rawText);
            console.log("🤖 [AI Core Evaluation]:", summary);
            
            if (canvasEngineInstance) {
                canvasEngineInstance.render();
            }
        };
    }
}