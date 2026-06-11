/**
 * Conveyer_2 AI Core Engine
 * Processes natural language field notes and maps text scripts to geometric states.
 */

import { globalState } from '../../turningFile.js';

export default class AICore {
    constructor() {
        /** @type {boolean} */
        this.isProcessing = false;
        /** @type {any[]} */
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
            /** @type {string[]} */
            actionsTriggered: [],
            /** @type {any[]} */
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
     * @param {string} text
     * @returns {any[] | null}
     */
    
    _parseTraverseCommand(text) {
        
        if (!text || typeof text !== 'string') return null;

        const tokens = text.toUpperCase().replace(/[:=,;\s]/g, ' ').split(' ').filter(Boolean);

        if (tokens.length === 0 || tokens.length % 2 !== 0) {
            console.warn("Input error: Unbalanced or empty tokens.");
            return null; 
        }

        let vectors = [];
        let azimuth = null;
        let distance = null;

        for (let i = 0; i < tokens.length; i += 2) { 
            const key = tokens[i]; 
            const val = parseFloat(tokens[i + 1])

            if (isNaN(val)) continue; 

            if (key === 'AZ' || key === 'AZIMUTH') azimuth = val;
            if (key === 'DIST' || key === 'DISTANCE') distance = val;

            if (azimuth !== null && distance !== null) {
                vectors.push({
                    type: 'traverse_vector',
                    azimuth,
                    distance,
                    timestamp: new Date().toISOString()
                });
                azimuth = null;
                distance = null;
            }
        }
        return vectors.length > 0 ? vectors : null;
    }
}