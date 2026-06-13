/**
 * Surveyor-3D Mounting Bridge
 * Instantiates the React root and renders the Surveyor3DCanvas into a target HTML container.
 * This lets the vanilla JS application boot up the R3F engine instantly.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { Surveyor3DCanvas } from './Surveyor3DCanvas.jsx';

/**
 * Mounts the 3D visualizer canvas inside a specified DOM node.
 * @param {string} containerId - The HTML element ID to render into.
 * @returns {import('react-dom/client').Root|null}
 */
export function mount3D(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`❌ [Surveyor-3D] Mount failed: Container element #${containerId} not found.`);
        return null;
    }
    
    console.log(`🛰️ [Surveyor-3D] Initializing Three.js context in container #${containerId}...`);
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <Surveyor3DCanvas />
        </React.StrictMode>
    );
    return root;
}
export default mount3D;
