/**
 * Gemini AI Client
 * Low-level wrapper around the Google Generative AI SDK.
 * Reads API key from Vite environment variable: VITE_GEMINI_API_KEY
 * 
 * Gracefully degrades — if no key is set, all methods return null
 * and log a warning instead of crashing.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// --- Singleton State ---
let genAI = null;
let defaultModel = null;
let isAvailable = false;

/**
 * Initialize the Gemini client. Safe to call multiple times — only runs once.
 * @param {string} apiKey - Your Google Generative AI API key
 * @returns {boolean} Whether the AI client is operational
 */
export function initGemini(apiKey) {
    if (genAI) return isAvailable;

    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
        console.warn('⚠️ [AI] No Gemini API key provided.');
        console.warn('⚠️ [AI] AI features will be disabled — app runs normally without them.');
        isAvailable = false;
        return false;
    }

    try {
        genAI = new GoogleGenerativeAI(apiKey);
        defaultModel = genAI.getGenerativeModel({ model: 'gemini-3.1-pro(High)' });
        isAvailable = true;
        console.log('🧠 [AI] Gemini client initialized successfully.');
    } catch (error) {
        console.error('❌ [AI] Failed to initialize Gemini client:', error.message);
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
 * Get the underlying GenerativeAI instance for advanced use
 * @returns {GoogleGenerativeAI | null}
 */
export function getGenAI() {
    return genAI;
}

/**
 * Send a one-shot prompt to Gemini and get a text response.
 * @param {string} prompt - The text prompt to send
 * @param {Object} [options] - Optional generation config overrides
 * @returns {Promise<string | null>} The response text, or null if unavailable
 */
export async function generateContent(prompt, options = {}) {
    if (!isAvailable || !defaultModel) {
        console.warn('⚠️ [AI] generateContent called but AI is not available.');
        return null;
    }

    try {
        const result = await defaultModel.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: options.temperature ?? 0.7,
                maxOutputTokens: options.maxTokens ?? 1024,
                ...options.generationConfig
            }
        });

        return result.response.text();
    } catch (error) {
        console.error('❌ [AI] Generation error:', error.message);
        return null;
    }
}

/**
 * Start a multi-turn chat session with Gemini.
 * @param {Object} [config] - Chat configuration
 * @param {string} [config.systemInstruction] - System-level instruction for the model
 * @param {Array}  [config.history] - Prior conversation history
 * @returns {Object | null} A chat session object, or null if unavailable
 */
export function startChat(config = {}) {
    if (!isAvailable || !genAI) {
        console.warn('⚠️ [AI] startChat called but AI is not available.');
        return null;
    }

    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-3.1-pro',
            systemInstruction: config.systemInstruction || undefined
        });

        return model.startChat({
            history: config.history || []
        });
    } catch (error) {
        console.error('❌ [AI] Failed to start chat session:', error.message);
        return null;
    }
}
