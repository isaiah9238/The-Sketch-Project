/**
 * Linearly interpolates between two numbers.
 * @param start - The beginning value (at fraction 0)
 * @param end - The target value (at fraction 1)
 * @param fraction - A value typically between 0 and 1 representing the progress
 */
function lerp(start: number, end: number, fraction: number): number {
    return start + (end - start) * fraction;
}

/**
 * Smoothly interpolates between 0 and 1 using an S-curve.
 * @param fraction - A progress value between 0 and 1
 */
function smoothstep(start: number, end: number, fraction: number): number {
    // First, clamp the fraction strictly between 0 and 1 to prevent errors
    const x = Math.max(0, Math.min(1, fraction));
    
    // Evaluate the standard smoothstep formula: 3x^2 - 2x^3
    const smoothFactor = x * x * (3 - 2 * x);
    
    // Apply the smoothed factor to our start and end points
    return start + (end - start) * smoothFactor;
}

// Example Usage:
// Look at how the progress ramps up differently than a straight line
console.log(smoothstep(10, 20, 0.2)); // Outputs: 11.04 (Slower acceleration at the start)
console.log(smoothstep(10, 20, 0.5)); // Outputs: 15.00 (Exactly half way)