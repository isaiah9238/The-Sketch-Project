/**
 * Surveyor-Sketch Canvas Engine Core
 * Manages the visual rendering pipeline, coordinate transformations,
 * and high-contrast UI state updates.
 */

import { getDistanceSq, getPerpendicularProjection, getMidpoint } from './coordinateMath.js';
import { globalState } from '../core/stateManager.js';

export default class CanvasEngine {
    /**
     * @param {HTMLCanvasElement} canvasElement 
     */
    constructor(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext('2d');
        
        // Render Viewport Parameter Matrix
        this.camera = { x: 0, y: 0, zoom: 5 };
        this.pen = { x: 0, y: 0 };
        this.snap = { active: false, x: 0, y: 0, type: '' };
        
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

    _drawBackgroundGrid(cx, cy) {
        const step = 10;
        const zoom = this.camera.zoom;
        if (step * zoom < 10) return;

        this.ctx.strokeStyle = '#1a1a1a'; // Neon terminal background accenting
        this.ctx.lineWidth = 1;

        // Simple calculation boundary lines
        // Grid logic loops draw dynamically using this.toScreen paths...
    }

    _renderGeometryPaths() {
        // Pull active coordinate paths straight out of your central state manager
        const currentCoordinates = globalState.coordinates;
        if (!currentCoordinates || currentCoordinates.length < 2) return;

        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = '#82ff6f'; // High-contrast Emerald Neon accent
        this.ctx.beginPath();

        const start = this.toScreen(currentCoordinates[0].x, currentCoordinates[0].y);
        this.ctx.moveTo(start.x, start.y);

        for (let i = 1; i < currentCoordinates.length; i++) {
            const pt = this.toScreen(currentCoordinates[i].x, currentCoordinates[i].y);
            this.ctx.lineTo(pt.x, pt.y);
        }
        this.ctx.stroke();
    }

    _renderOverlays() {
        const p = this.toScreen(this.pen.x, this.pen.y);
        this.ctx.fillStyle = '#82ff6f';
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        this.ctx.fill();
    }
}