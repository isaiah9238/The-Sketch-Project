/**
 * Linearly interpolates between two numbers.
 * @param {number} start - The beginning value (at fraction 0)
 * @param {number} end - The target value (at fraction 1)
 * @param {number} fraction - A value typically between 0 and 1 representing the progress
 * @returns {number}
 */
export function lerp(start, end, fraction) {
    return start + (end - start) * fraction;
}

/**
 * Smoothly interpolates between 0 and 1 using an S-curve.
 * @param {number} start
 * @param {number} end
 * @param {number} fraction - A progress value between 0 and 1
 * @returns {number}
 */
export function smoothstep(start, end, fraction) {
    // First, clamp the fraction strictly between 0 and 1 to prevent errors
    const x = Math.max(0, Math.min(1, fraction));
    
    // Evaluate the standard smoothstep formula: 3x^2 - 2x^3
    const smoothFactor = x * x * (3 - 2 * x);
    
    // Apply the smoothed factor to our start and end points
    return start + (end - start) * smoothFactor;
}

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