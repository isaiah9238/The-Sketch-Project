/**
 * Conveyer_2 AI Core Engine
 * Processes natural language field notes and maps text scripts to geometric states.
 */

import { globalState } from '../../turningFile.js';
import { aiModel } from '../../libs/firebase-init.js';

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
     * @returns {Promise<Object>} Operational summary of what was parsed and updated
     */
    async processInput(rawInput) {
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
            /** @type {import('../../turningFile.js').TraverseVector[]} */
            let parsedTraverses = [];
            let aiSuccess = false;

            // 1. Attempt to extract traverse vectors using Firebase AI Logic (Gemini)
            try {
                console.log("🤖 [AI Core] Sending input to Gemini for structured traverse extraction...");
                const responseResult = await aiModel.generateContent(rawInput);
                const responseText = responseResult.response.text();
                console.log("🤖 [AI Core] Gemini response:", responseText);

                if (responseText) {
                    const parsedJson = JSON.parse(responseText);
                    if (Array.isArray(parsedJson) && parsedJson.length > 0) {
                        parsedTraverses = parsedJson.map(item => ({
                            type: 'traverse_vector',
                            azimuth: Number(item.azimuth),
                            distance: Number(item.distance),
                            timestamp: new Date().toISOString()
                        })).filter(vec => !isNaN(vec.azimuth) && !isNaN(vec.distance));

                        if (parsedTraverses.length > 0) {
                            aiSuccess = true;
                            result.actionsTriggered.push("AI_TRAVERSE_EXTRACTION");
                        }
                    }
                }
            } catch (aiError) {
                console.warn("⚠️ [AI Core] Firebase AI Logic extraction failed or offline, falling back to manual parser:", aiError);
            }

            // 2. Fallback to manual string parser if Gemini failed or returned no vectors
            if (!aiSuccess) {
                const manualTraverses = this._parseTraverseCommand(rawInput);
                if (manualTraverses && manualTraverses.length > 0) {
                    parsedTraverses = manualTraverses;
                    result.actionsTriggered.push("MANUAL_TRAVERSE_EXTRACTION");
                }
            }

            // Update state and results if vectors were successfully found
            if (parsedTraverses && parsedTraverses.length > 0) {
                this.LastExtractedPoints = parsedTraverses;
                globalState.traverseVectors.push(...parsedTraverses);
                result.extractedVectors.push(...parsedTraverses);
            }

            // 3. Process text to update global state notes if it's a field description
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

        // Split text into uppercase clean tokens
        const tokens = text.toUpperCase().replace(/[:=,;\s]/g, ' ').split(' ').filter(Boolean);

        // FIXED: Removed the "% 2 !== 0" check so free-form sentences don't break the parser
        if (tokens.length === 0) {
            console.warn("Input error: Empty tokens.");
            return null; 
        }

        let vectors = [];
        let azimuth = null;
        let distance = null;

        for (let i = 0; i < tokens.length; i++) { 
            // FIXED: Renamed this to 'token' to match your conditional blocks below
            const token = tokens[i]; 
        
            if (token === 'AZ' || token === 'AZIMUTH') {
                const nextVal = parseFloat(tokens[i + 1]);
                if (!isNaN(nextVal)) {
                    azimuth = nextVal;
                    i++; // Safely skip the number token we just consumed
                }
            } else if (token === 'DIST' || token === 'DISTANCE') {
                const nextVal = parseFloat(tokens[i + 1]);
                if (!isNaN(nextVal)) {
                    distance = nextVal;
                    i++; // Safely skip the number token we just consumed
                    
                    // Evaluate if a complete geodetic pair has been formed right here!
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
            }
        }    
        return vectors.length > 0 ? vectors : null;                                
    }
}