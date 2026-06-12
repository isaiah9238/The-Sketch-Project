/**
 * Core Mathematical Interpolation Module
 * Provides pure interpolation primitives for animations and coordinate easing.
 */

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
