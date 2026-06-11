/**
 * Conveyer_2 AI Core Engine
 * Processes natural language field notes and maps text scripts to geometric states.
 */

import { globalState } from '../../turningFile.js';

export default class AICore {
    constructor() {
        /** @type {boolean} */
        this.isProcessing = false;
        /** * Local cache of the last parsed vectors 
         * @type {import('../../turningFile.js').TraverseVector[]} 
         */
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
            /** @type {import('../../turningFile.js').TraverseVector[]} */
            extractedVectors: [],
            /** @type {import('../../turningFile.js').ParcelFieldNote[]} */
            AppStatefieldNote: []
        };

        try {
            // 1. Check for explicit Azimuth/Distance traverse shortcuts
            if (lowercaseInput.includes('az') && lowercaseInput.includes('dist')) {
                const parsedTraverses = this._parseTraverseCommand(rawInput);
                if (parsedTraverses && parsedTraverses.length > 0) {
                    this.LastExtractedPoints = parsedTraverses;
                    
                    // Route to raw vectors list in global state
                    globalState.traverseVectors.push(...parsedTraverses);
                    
                    result.extractedVectors.push(...parsedTraverses);
                    result.actionsTriggered.push("TRAVERSE_EXTRACTION");
                }
            }

            // 2. Process text to update global state notes if it's a field description
            if (lowercaseInput.includes('parcel') || lowercaseInput.includes('area')) {
                /** @type {import('../../turningFile.js').ParcelFieldNote} */
                const newNote = {
                    timestamp: new Date().toISOString(),
                    parcelID: "UNKNOWN_OR_PARSED_ID", // Replace with a real parser/string if available
                    text: rawInput.trim(),
                };

                // Push to the newly typed globalState.notes array
                globalState.notes.push(newNote);
                
                // Track it in your local function response
                result.AppStatefieldNote.push(newNote);
                result.actionsTriggered.push("PARCEL_NOTE_LOGGED");
            }

        } catch (error) {
            console.error("AI Core internal processing fault:", error);
            result.success = false;
        } finally {
            this.isProcessing = false;
        }

        return result;
    }

    /**
     * Internal text parser to pull raw bearing/distance vectors out of free-form text strings.
     * @private
     * @param {string} text
     * @returns {import('../../turningFile.js').TraverseVector[] | null}
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
            const val = parseFloat(tokens[i + 1]);

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