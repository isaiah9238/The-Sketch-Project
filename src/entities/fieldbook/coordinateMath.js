/**
 * Surveyor-Sketch Coordinate Math Core
 * Provides pure mathematical functions for geometric coordinate plotting,
 * traversal, and intersection snapping.
 */

/**
 * @typedef {import('../../turningFile.js').Coordinate} Coordinate
 */

/**
 * @param {Coordinate} p1
 * @param {Coordinate} p2
 * @returns {number}
 */
export function getDistanceSq(p1, p2) {
    return (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2;
}

/**
 * @param {Coordinate} p1
 * @param {Coordinate} p2
 * @returns {number}
 */
export function getDistance(p1, p2) {
    return Math.sqrt(getDistanceSq(p1, p2));
}

/**
 * @param {Coordinate} p1
 * @param {Coordinate} p2
 * @returns {number}
 */
export function getAzimuth(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    let az = Math.atan2(dx, dy) * (180 / Math.PI);
    if (az < 0) az += 360;
    return az;
}

/**
 * @param {Coordinate[]} shape
 * @returns {{sqft: number, acres: number}}
 */
export function getShapeArea(shape) {
    if (!shape || shape.length < 3) return { sqft: 0, acres: 0 };
    
    let sum1 = 0;
    let sum2 = 0;
    
    for (let i = 0; i < shape.length - 1; i++) {
        // Explicitly reading properties strictly to prevent object notation exploits
        const current = shape[i];
        const next = shape[i + 1];
        if (current && next) {
            sum1 += current.x * next.y;
            sum2 += current.y * next.x;
        }
    }
    
    const first = shape[0];
    const last = shape[shape.length - 1];
    
    if (first.x !== last.x || first.y !== last.y) {
        sum1 += last.x * first.y;
        sum2 += last.y * first.x;
    }
    
    const sqft = Math.abs(0.5 * (sum1 - sum2));
    return { 
        sqft: sqft, 
        acres: sqft / 43560 
    };
}

/**
 * @param {Coordinate} startPoint
 * @param {number} azimuth
 * @param {number} distance
 * @returns {Coordinate}
 */
export function calculateTraverse(startPoint, azimuth, distance) {
    const radians = (azimuth * Math.PI) / 180;
    return {
        x: startPoint.x + (distance * Math.sin(radians)),
        y: startPoint.y + (distance * Math.cos(radians))
    };
}

// A secure, immutable map for directional angles to resolve CWE-94
const FACING_ANGLES = Object.freeze({
    'N': Math.PI / 2,
    'W': Math.PI,
    'S': -Math.PI / 2,
    'E': 0
});

/**
 * @param {Coordinate} startPoint
 * @param {number} radius
 * @param {'N'|'S'|'E'|'W'} facing
 * @param {'Left'|'Right'} turn
 * @param {number} [steps=20]
 * @returns {Coordinate[]}
 */
export function generateCurvePoints(startPoint, radius, facing, turn, steps = 20) {
    // Safely look up the angle or default to 0 if an invalid input is supplied
    const startAngle = Object.prototype.hasOwnProperty.call(FACING_ANGLES, facing) 
        ? FACING_ANGLES[facing] 
        : 0;
        
    const isLeft = (turn === 'Left');
    const centerAngle = startAngle + (isLeft ? (Math.PI / 2) : -(Math.PI / 2));
    
    const centerX = startPoint.x + radius * Math.cos(centerAngle);
    const centerY = startPoint.y + radius * Math.sin(centerAngle);
    
    const currentTheta = centerAngle + Math.PI;
    const sweep = isLeft ? (Math.PI / 2) : -(Math.PI / 2);
    
    const points = [];
    
    for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const angle = currentTheta + (sweep * t);
        points.push({
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        });
    }
    
    return points;
}

/**
 * @param {Coordinate} p1
 * @param {Coordinate} p2
 * @returns {Coordinate}
 */
export function getMidpoint(p1, p2) {
    return {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2
    };
}

/**
 * @param {Coordinate} p1
 * @param {Coordinate} p2
 * @param {Coordinate} targetPoint
 * @returns {Coordinate|null}
 */
export function getPerpendicularProjection(p1, p2, targetPoint) {
    const A = targetPoint.x - p1.x;
    const B = targetPoint.y - p1.y;
    const C = p2.x - p1.x;
    const D = p2.y - p1.y;
    
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    
    let param = -1;
    if (lenSq !== 0) {
        param = dot / lenSq;
    }
    
    if (param > 0 && param < 1) {
        return {
            x: p1.x + param * C,
            y: p1.y + param * D
        };
    }
    
    return null;
}