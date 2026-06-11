/**
 * Surveyor-Sketch Canvas Engine Core
 * Manages the visual rendering pipeline, coordinate transformations,
 * and high-contrast UI state updates.
 */

import { getDistance } from './coordinateMath.js';
import { globalState } from '../../turningFile.js';
import { getCentroid, generateTargetCircle, generateMorphGeometry } from '../../sequences/tunnel/morphEngine.js';

/**
 * @typedef {Object} MorphState
 * @property {boolean} active
 * @property {number} fraction
 * @property {import('../../turningFile.js').Coordinate[]} originalGeometry
 * @property {import('../../turningFile.js').Coordinate[]} targetGeometry
 * @property {number} startTime
 * @property {number} duration
 */

export default class CanvasEngine {
    /**
     * @param {HTMLCanvasElement} canvasElement 
     */
    constructor(canvasElement) {
        /** @type {HTMLCanvasElement} */
        this.canvas = canvasElement;
        /** @type {CanvasRenderingContext2D} */
        // @ts-ignore
        this.ctx = canvasElement.getContext('2d');
        
        // Render Viewport Parameter Matrix
        this.camera = { x: 0, y: 0, zoom: 1.5 };
        this.pen = { x: 0, y: 0 };
        this.snap = { active: false, x: 0, y: 0, type: '' };
        
        /** @type {MorphState} */
        this.morphState = { 
            active: false, 
            fraction: 0, 
            originalGeometry: [], 
            targetGeometry: [],
            startTime: 0,
            duration: 2000
        };
        
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        this.initHardware();
    }

    initHardware() {
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.resize();
        
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.render();
    }

    /**
     * Map Cartesian surveying coordinates safely across screen viewport parameters
     * Inverts the Y-Axis so positive values move Upwards natively
     * @param {number} worldX
     * @param {number} worldY
     * @returns {{x: number, y: number}}
     */
    toScreen(worldX, worldY) {
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;
        return {
            x: (worldX - this.camera.x) * this.camera.zoom + cx,
            y: (this.camera.y - worldY) * this.camera.zoom + cy
        };
    }

    render() {
        // Clear viewport loop
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;

        // 1. Draw Geometric Grid lines
        this._drawBackgroundGrid(cx, cy);

        // 2. Render Active Parcels and Geometry Paths from stateManager
        this._renderGeometryPaths();

        // 3. Draw Active Crosshairs / Intersection Overlays
        this._renderOverlays();
    }

    /**
     * @param {number} cx
     * @param {number} cy
     */
    _drawBackgroundGrid(cx, cy) {
        const step = 10;
        const zoom = this.camera.zoom;
        if (step * zoom < 5) return;

        this.ctx.strokeStyle = '#1a1a1a'; // Neon terminal background accenting
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();

        const minWorldX = this.camera.x - (cx / zoom);
        const maxWorldX = this.camera.x + (cx / zoom);
        const minWorldY = this.camera.y - (cy / zoom);
        const maxWorldY = this.camera.y + (cy / zoom);

        const startX = Math.floor(minWorldX / step) * step;
        const startY = Math.floor(minWorldY / step) * step;

        for (let x = startX; x <= maxWorldX; x += step) {
            const screenPt1 = this.toScreen(x, minWorldY);
            const screenPt2 = this.toScreen(x, maxWorldY);
            this.ctx.moveTo(screenPt1.x, screenPt1.y);
            this.ctx.lineTo(screenPt2.x, screenPt2.y);
        }

        for (let y = startY; y <= maxWorldY; y += step) {
            const screenPt1 = this.toScreen(minWorldX, y);
            const screenPt2 = this.toScreen(maxWorldX, y);
            this.ctx.moveTo(screenPt1.x, screenPt1.y);
            this.ctx.lineTo(screenPt2.x, screenPt2.y);
        }

        this.ctx.stroke();
    }

    _renderGeometryPaths() {
        // Pull active coordinate paths straight out of your central state manager
        const currentCoordinates = globalState.coordinates;
        if (!currentCoordinates || currentCoordinates.length < 1) return; // Allow rendering even with 1+ points

        let renderCoordinates = currentCoordinates;
        if (this.morphState.active) {
            renderCoordinates = generateMorphGeometry(
                this.morphState.originalGeometry,
                this.morphState.targetGeometry,
                this.morphState.fraction
            );
        }

        // Save context state to prevent style pollution
        this.ctx.save();
        
        this.ctx.lineWidth = 3;             // Slightly thicker line for high visibility
        this.ctx.strokeStyle = '#82ff6f';   // High-contrast Emerald Neon accent
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        this.ctx.beginPath();

        // Establish the anchor mapping
        const start = this.toScreen(renderCoordinates[0].x, renderCoordinates[0].y);
        this.ctx.moveTo(start.x, start.y);

        // Explicitly draw lines connecting all sequential coordinates
        for (let i = 1; i < renderCoordinates.length; i++) {
            const pt = renderCoordinates[i];
            const screenPt = this.toScreen(pt.x, pt.y);
            this.ctx.lineTo(screenPt.x, screenPt.y);
        }
        
        this.ctx.stroke();
        this.ctx.restore(); // Restore safely
    }

    _renderOverlays() {
        const p = this.toScreen(this.pen.x, this.pen.y);
        this.ctx.fillStyle = '#82ff6f';
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw On-Screen Diagnostic HUD
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'left';
        
        const coords = globalState.coordinates || [];
        this.ctx.fillText(`[SYS] Tracked Points: ${coords.length}`, 10, 20);
        
        if (coords.length > 0) {
            const last = coords[coords.length - 1];
            this.ctx.fillText(`[SYS] Pen: {x: ${this.pen.x.toFixed(2)}, y: ${this.pen.y.toFixed(2)}}`, 10, 40);
            this.ctx.fillText(`[SYS] Last Pt: {x: ${last.x.toFixed(2)}, y: ${last.y.toFixed(2)}}`, 10, 60);
        }
    }

    /**
     * Starts the animation sequence to morph the current geometry into a transit circle
     * @param {number} duration - Time in ms for the morph to complete
     */
    startMorph(duration = 2000) {
        if (!globalState.coordinates || globalState.coordinates.length < 3) {
            console.warn("[Canvas Engine] Need at least 3 points to morph into a circle.");
            return;
        }
        
        const originalPts = [...globalState.coordinates];
        const centroid = getCentroid(originalPts);
        const radius = 50; 
        
        this.morphState = {
            active: true,
            fraction: 0,
            originalGeometry: originalPts,
            targetGeometry: generateTargetCircle(centroid, radius, originalPts.length),
            startTime: performance.now(),
            duration: duration
        };
        
        const animate = (/** @type {number} */ time) => {
            if (!this.morphState.active) return;
            
            let elapsed = time - this.morphState.startTime;
            let progress = Math.min(elapsed / this.morphState.duration, 1);
            
            this.morphState.fraction = progress;
            this.render();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                console.log("✨ [Morph Sequence] Transformation complete. Ready for Tunnel.");
            }
        };
        
        requestAnimationFrame(animate);
    }
}