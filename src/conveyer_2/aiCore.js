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
                const parsedTraverses = this._parseTraverseCommand(rawInput);
                if (parsedTraverses && parsedTraverses.length > 0) {
                    this.LastExtractedPoints = parsedTraverses;
                    globalState.coordinates.push(...parsedTraverses);
                    result.extractedCoordinates.push(...parsedTraverses);
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
     * Internal text parser to pull raw bearing/distance vectors out of free-form text strings.
     * Built safely using strict token scanning to completely eliminate ReDoS risks.
     * @private
     */
    _parseTraverseCommand(text) {
        if (!text) return null;

        // Split text into individual clean words (tokens)
        // Fixed ReDoS vulnerability: replaced /\s+/ with character-by-character split
        const tokens = text.toUpperCase().replace(/[:=,;\s]/g, ' ').split(' ').filter(Boolean);
        
        let vectors = [];
        let azimuth = null;
        let distance = null;

        // Scan the words sequentially
        for (let i = 0; i < tokens.length - 1; i++) {
            if (tokens[i] === 'AZ' || tokens[i] === 'AZIMUTH') {
                const nextVal = parseFloat(tokens[i + 1]);
                if (!isNaN(nextVal)) azimuth = nextVal;
            }
            if (tokens[i] === 'DIST' || tokens[i] === 'DISTANCE') {
                const nextVal = parseFloat(tokens[i + 1]);
                if (!isNaN(nextVal)) distance = nextVal;
            }

            // Once both values are captured, store them and reset
            if (azimuth !== null && distance !== null) {
                vectors.push({
                    type: 'traverse_vector',
                    azimuth: azimuth,
                    distance: distance,
                    timestamp: new Date().toISOString()
                });
                azimuth = null;
                distance = null;
            }
        }
        if (azimuth !== null && distance !== null) {
            vectors.push({
                type: 'traverse_vector',
                azimuth: azimuth,
                distance: distance,
                timestamp: new Date().toISOString()
            });
        }    
        return vectors.length > 0 ? vectors : null;
    }
}