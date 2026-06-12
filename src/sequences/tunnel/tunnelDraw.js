/**
 * Funnel Draw Generator Module
 * Mathematically projects a balanced hopper and spout framework onto the canvas coordinate grid.
 */

/** @typedef {import('../../turningFile.js').Coordinate} Coordinate */

/**
 * Calculates the sequential vertices required to sketch a vertical funnel.
 * @param {Coordinate} startPoint - The center-top anchor coordinate of the hopper.
 * @param {number} hopperWidth - The total width of the top mouth.
 * @param {number} hopperHeight - The vertical depth of the tapering section.
 * @param {number} spoutWidth - The thickness of the escape tube.
 * @param {number} spoutLength - The downward extension of the tube.
 * @returns {Coordinate[]} A sequential array of vertices to trace the complete funnel profile.
 */
export function generateFunnelVertices(startPoint, hopperWidth, hopperHeight, spoutWidth, spoutLength) {
    const halfMouth = hopperWidth / 2;
    const halfSpout = spoutWidth / 2;

    // Build the structural vertex path sequentially around the perimeter
    /** @type {Coordinate[]} */
    const tunnelpath = [
        // 1. Top Left Mouth
        { x: startPoint.x - halfMouth, y: startPoint.y },
        
        // 2. Bottom Left Hopper Junction
        { x: startPoint.x - halfSpout, y: startPoint.y + hopperHeight },
        
        // 3. Bottom Left Spout Tip
        { x: startPoint.x - halfSpout, y: startPoint.y + hopperHeight + spoutLength },
        
        // 4. Bottom Right Spout Tip
        { x: startPoint.x + halfSpout, y: startPoint.y + hopperHeight + spoutLength },
        
        // 5. Bottom Right Hopper Junction
        { x: startPoint.x + halfSpout, y: startPoint.y + hopperHeight },
        
        // 6. Top Right Mouth
        { x: startPoint.x + halfMouth, y: startPoint.y }
    ];

    return tunnelpath;
}