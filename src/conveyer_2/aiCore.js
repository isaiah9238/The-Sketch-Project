/**
 * Conveyer_2 AI Core Engine
 * Processes natural language field notes and maps text scripts to geometric states.
 */

import { globalState } from '../core/stateManager.js';

export default class AICore {
    constructor() {
        this.isProcessing = false;
        this.LastExtractedPoints = [];
    }

    /**
     * Main entry point to process inbound raw text, note strings, or script commands.
     * @param {string} rawInput 
     * @returns {Object} Operational summary of what was parsed and updated
     */
    processInput(rawInput) {
        if (!rawInput || typeof rawInput !== 'string') {
            return { success: false, message: "Invalid or empty input text." };
        }

        this.isProcessing = true;
        const lowercaseInput = rawInput.toLowerCase();
        
        const result = {
            success: true,
            actionsTriggered: [],
            extractedCoordinates: []
        };

        try {
            // 1. Check for explicit Azimuth/Distance traverse shortcuts (e.g., "AZ 90 DIST 150")
            if (lowercaseInput.includes('az') && lowercaseInput.includes('dist')) {
                const parsedTraverse = this._parseTraverseCommand(rawInput);
                if (parsedTraverse) {
                    globalState.coordinates.push(parsedTraverse);
                    result.extractedCoordinates.push(parsedTraverse);
                    result.actionsTriggered.push("TRAVERSE_EXTRACTION");
                }
            }

            // 2. Process text to update global state notes if it's a field description
            if (lowercaseInput.includes('parcel') || lowercaseInput.includes('boundary')) {
                globalState.notes.push({
                    timestamp: new Date().toISOString(),
                    text: rawInput.trim()
                });
                result.actionsTriggered.push("PARCEL_NOTE_LOGGED");
            }

        } catch (error) {
            console.error("AI Core internal processing fault:", error);
            result.success = false;
            result.error = error.message;
        } finally {
            this.isProcessing = false;
        }

        return result;
    }

    /**
     * Internal regex parser to pull raw bearing/distance vectors out of free-form text strings
     * @private
     */
    _parseTraverseCommand(text) {
        // Simple regex looking for numbers following AZ/Bearing indicators and distances
        const azMatch = text.match(/az(?:imuth)?\s*[:=]?\s*([0-9.]+)/i);
        const distMatch = text.match(/dist(?:ance)?\s*[:=]?\s*([0-9.]+)/i);

        if (azMatch && distMatch) {
            return {
                type: 'traverse_vector',
                azimuth: parseFloat(azMatch[1]),
                distance: parseFloat(distMatch[1]),
                timestamp: new Date().toISOString()
            };
        }
        return null;
    }
}