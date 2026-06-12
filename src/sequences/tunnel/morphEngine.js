import { lerp, smoothstep } from '../../core/math/interpolation.js';


/**
 * Calculates the geometric centroid of a polygon.
 * @param {import('../../turningFile.js').Coordinate[]} points 
 * @returns {import('../../turningFile.js').Coordinate}
 */
export function getCentroid(points) {
    if (!points || points.length === 0) return { x: 0, y: 0 };
    let sumX = 0;
    let sumY = 0;
    for (const p of points) {
        sumX += p.x;
        sumY += p.y;
    }
    return { x: sumX / points.length, y: sumY / points.length };
}

/**
 * Generates a perfect circle of coordinates around a centroid.
 * @param {import('../../turningFile.js').Coordinate} centroid 
 * @param {number} radius 
 * @param {number} pointCount 
 * @returns {import('../../turningFile.js').Coordinate[]}
 */
export function generateTargetCircle(centroid, radius, pointCount) {
    const points = [];
    for (let i = 0; i < pointCount; i++) {
        const theta = (i / pointCount) * Math.PI * 2;
        points.push({
            x: centroid.x + radius * Math.cos(theta),
            y: centroid.y + radius * Math.sin(theta)
        });
    }
    return points;
}

/**
 * Linearly interpolates a full set of coordinates towards a target shape.
 * @param {import('../../turningFile.js').Coordinate[]} originalPoints 
 * @param {import('../../turningFile.js').Coordinate[]} targetPoints 
 * @param {number} fraction 
 * @returns {import('../../turningFile.js').Coordinate[]}
 */
export function generateMorphGeometry(originalPoints, targetPoints, fraction) {
    const smoothed = smoothstep(0, 1, fraction);
    const morphed = [];
    for (let i = 0; i < originalPoints.length; i++) {
        const start = originalPoints[i];
        const end = targetPoints[i % targetPoints.length];
        morphed.push({
            x: lerp(start.x, end.x, smoothed),
            y: lerp(start.y, end.y, smoothed),
            timestamp: start.timestamp
        });
    }
    return morphed;
}