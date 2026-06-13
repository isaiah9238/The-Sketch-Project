/**
 * Surveyor-3D Hooks and Mathematical Mapping Registry
 * Provides a clear, documented gateway translating the 2D coordinate calculus
 * and surveying physics into 3D spatial coordinate frames.
 * 
 * Side-by-side agents or developer systems can instantly query this registry
 * to understand exactly how 2D survey coordinates map onto the 3D Three.js environment.
 */

import { useState, useEffect } from 'react';
import { globalState, stateManager } from '../../turningFile.js';
import { calculateTraverse, getAzimuth, getDistance } from '../../entities/fieldbook/coordinateMath.js';
import { getCentroid, generateTargetCircle } from '../../sequences/tunnel/morphEngine.js';

/**
 * @typedef {Object} Vector3D
 * @property {number} x - Easting (Maps from 2D coordinate X)
 * @property {number} y - Elevation (Vertical Height channel)
 * @property {number} z - Northing (Maps from inverted 2D coordinate Y: -y)
 */

/**
 * Configuration matrix for the 2D -> 3D coordinate transformation.
 * Standardizes the mapping:
 * - 2D X becomes 3D X (Easting)
 * - 2D Y becomes 3D -Z (Northing, matching Three.js forward direction)
 * - 3D Y represents the vertical elevation channel (calculated or simulated)
 */
export const COORDINATE_CONFIG_3D = Object.freeze({
    xScale: 1.0,
    zScale: -1.0, // Inverted to represent typical 3D depth alignment
    elevationStep: 5.0, // Elevation gain per segment for spiral/winding traverses
    baseElevation: 0.0
});

/**
 * Pure function mapping a 2D survey coordinate to a 3D space vector.
 * @param {import('../../turningFile.js').Coordinate} coord2d 
 * @param {number} [index=0] - Segment index to determine procedural elevation
 * @param {number} [elevationFactor=1.0] - Coefficient to scale vertical elevation
 * @returns {Vector3D}
 */
export function map2DTo3D(coord2d, index = 0, elevationFactor = 1.0) {
    if (!coord2d || typeof coord2d.x !== 'number' || typeof coord2d.y !== 'number') {
        return { x: 0, y: 0, z: 0 };
    }
    return {
        x: coord2d.x * COORDINATE_CONFIG_3D.xScale,
        y: COORDINATE_CONFIG_3D.baseElevation + (index * COORDINATE_CONFIG_3D.elevationStep * elevationFactor),
        z: coord2d.y * COORDINATE_CONFIG_3D.zScale
    };
}

/**
 * Hook subscribing to the active coordinate state and exposing the 3D-mapped paths.
 * @param {number} [elevationFactor=0.0] - Use 0.0 for a flat 3D projection, or higher for a helical 3D path.
 * @returns {Vector3D[]} Array of 3D vectors representing the current parcel path.
 */
export function use3DCoordinates(elevationFactor = 0.0) {
    const [coords, setCoords] = useState(globalState.coordinates || []);

    useEffect(() => {
        // Subscribe to globalState changes
        const unsubscribe = stateManager.subscribe((/** @type {import('../../turningFile.js').AppState} */ state) => {
            setCoords(state.coordinates || []);
        });
        return () => unsubscribe();
    }, []);

    return coords.map((/** @type {any} */ c, /** @type {number} */ idx) => map2DTo3D(c, idx, elevationFactor));
}

/**
 * Hook that computes and exposes the 3D centroid of the active parcel.
 * @returns {Vector3D}
 */
export function use3DCentroid() {
    const [coords, setCoords] = useState(globalState.coordinates || []);

    useEffect(() => {
        const unsubscribe = stateManager.subscribe((/** @type {import('../../turningFile.js').AppState} */ state) => {
            setCoords(state.coordinates || []);
        });
        return () => unsubscribe();
    }, []);

    if (coords.length === 0) return { x: 0, y: 0, z: 0 };
    const centroid2D = getCentroid(coords);
    return map2DTo3D(centroid2D, Math.floor(coords.length / 2), 0.5);
}

/**
 * Hook exposing the live state of the Morph sequence (fraction and target geometry mapped to 3D).
 * Useful for syncing 3D animations with the canvas engine morphing sequence.
 */
export function use3DMorphState() {
    const [morphActive, setMorphActive] = useState(false);
    const [fraction, setFraction] = useState(0);
    const [points, setPoints] = useState([]);
    
    // We check the canvasEngineInstance's state to coordinate visual synchronization
    useEffect(() => {
        /** @type {number} */
        let frameId;
        const checkCanvasEngine = () => {
            // @ts-ignore
            const engine = window.currentCanvasEngine;
            if (engine && engine.morphState) {
                setMorphActive(engine.morphState.active);
                setFraction(engine.morphState.fraction);
                
                if (engine.morphState.active) {
                    // Extract morph shape points
                    setPoints(engine.morphState.targetGeometry || []);
                }
            }
            frameId = requestAnimationFrame(checkCanvasEngine);
        };
        
        frameId = requestAnimationFrame(checkCanvasEngine);
        return () => cancelAnimationFrame(frameId);
    }, []);

    const points3D = points.map((/** @type {any} */ p, /** @type {number} */ idx) => map2DTo3D(p, idx, 0.5));

    return {
        active: morphActive,
        fraction: fraction,
        targetPoints3D: points3D
    };
}

/**
 * Helper hook to perform 3D traverses natively.
 * Computes a step vector using 2D azimuth physics and projects it into 3D.
 * @param {Vector3D} startPosition 
 * @param {number} azimuthDegrees - Heading from North (clockwise)
 * @param {number} distance - Length of traverse step
 * @param {number} [elevationGain=0.0] - Vertical offset of traverse
 * @returns {Vector3D} The landing position in 3D
 */
export function calculateTraverse3D(startPosition, azimuthDegrees, distance, elevationGain = 0.0) {
    // 2D calculations
    const start2D = {
        x: startPosition.x / COORDINATE_CONFIG_3D.xScale,
        y: startPosition.z / COORDINATE_CONFIG_3D.zScale
    };
    const target2D = calculateTraverse(start2D, azimuthDegrees, distance);
    
    return {
        x: target2D.x * COORDINATE_CONFIG_3D.xScale,
        y: startPosition.y + elevationGain,
        z: target2D.y * COORDINATE_CONFIG_3D.zScale
    };
}
