/**
 * Gemini AI Client
 * Low-level wrapper around the Google Generative AI SDK.
 * Reads API key from Vite environment variable: VITE_GEMINI_API_KEY
 * * Gracefully degrades — if no key is set, all methods return null
 * and log a warning instead of crashing.
 */

import { ApiError, GoogleGenAI } from "@google/genai";

// --- Singleton State ---
/** @type {any} */
let genAI = null;
/** @type {boolean} */
let isAvailable = false;

/**
 * Initialize the Gemini client. Safe to call multiple times — only runs once.
 * @param {string} GEMINI_API_KEY - Your Google Generative AI API key
 * @returns {boolean} Whether the AI client is operational
 */
export function initGemini(GEMINI_API_KEY) {
    if (genAI) return isAvailable;

    if (!GEMINI_API_KEY || typeof GEMINI_API_KEY !== 'string' || GEMINI_API_KEY.trim() === '') {
        console.warn('⚠️ [AI] No Gemini API key provided.');
        console.warn('⚠️ [AI] AI features will be disabled — app runs normally without them.');
        isAvailable = false;
        return false;
    }

    try {
        // FIX: Map the argument variable string to the required parameter property 'apiKey'
        genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        isAvailable = true;
        console.log('🧠 [AI] Gemini client initialized successfully with @google/genai.');
    } catch (error) {
        console.error('❌ [AI] Failed to initialize Gemini client:', error);
        isAvailable = false;
    }
    
    return isAvailable;
}

/**
 * Check if the AI client is ready to use
 * @returns {boolean}
 */
export function isGeminiAvailable() {
    return isAvailable;
}

/**
 * Get the underlying GoogleGenAI instance for advanced use
 * @returns {any}
 */
export function getGenAI() {
    return genAI;
}

/**
 * Send a one-shot prompt to Gemini and get a text response.
 * @param {string} prompt - The text prompt to send
 * @param {{temperature?: number, maxTokens?: number, systemInstruction?: string, config?: any}} [options] - Optional generation config overrides
 * @returns {Promise<string | null>} The response text, or null if unavailable
 */
export async function generateContent(prompt, options = {}) {
    if (!isAvailable || !genAI) {
        console.warn('⚠️ [AI] generateContent called but AI is not available.');
        return null;
    }

    try {
        // securecoder-disable-next-line CWE-1188
        const result = await genAI.models.generateContent({
            model: 'gemini-2.5-flash', // Updated to the stable 2026 production model identifier
            contents: prompt,
            config: {
                temperature: options.temperature ?? 0.7,
                maxOutputTokens: options.maxTokens ?? 1024,
                systemInstruction: options.systemInstruction || undefined,
                safetySettings: [
                    {
                        category: 'HARM_CATEGORY_HATE_SPEECH',
                        threshold: 'BLOCK_LOW_AND_ABOVE',
                    },
                    {
                        category: 'HARM_CATEGORY_HARASSMENT',
                        threshold: 'BLOCK_LOW_AND_ABOVE',
                    },
                    {
                        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
                    },
                    {
                        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
                    },
                ],
                ...options.config
            },
        });

        return result.text;
    } catch (error) {
        console.error('❌ [AI] Generation error:', error);
        return null;
    }
}

/**
 * Start a multi-turn chat session with Gemini.
 * @param {{systemInstruction?: string, history?: any[]}} [options] - Chat configuration options
 * @returns {any} A chat session object, or null if unavailable
 */
export function startChat(options = {}) {
    if (!isAvailable || !genAI) {
        console.warn('⚠️ [AI] startChat called but AI is not available.');
        return null;
    }

    try {
        // securecoder-disable-next-line
        return genAI.chats.create({
            model: 'gemini-2.5-pro', // Updated to stable 2026 production version
            history: options.history || [],
            config: {
                systemInstruction: options.systemInstruction || undefined
            }
        });
    } catch (error) {
        console.error('❌ [AI] Failed to start chat session:', error);
        return null;
    }
}