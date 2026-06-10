/**
 * Conversation Engine
 * Character-driven dialogue system for The Sketch Project.
 * 
 * Two personas:
 *   - The Sketch (Field Book): Precise, terse, speaks in bearings and measurements.
 *   - The Notepad (Conveyer): Conversational companion, curious, asks good questions.
 * 
 * Built on top of geminiClient.js — gracefully inactive when no API key is present.
 */

import { initGemini, isGeminiAvailable, startChat } from './geminiClient.js';
import { globalState } from '../turningFile.js';

// --- Character Definitions ---

const SYSTEM_INSTRUCTION = `You are two characters inside a land surveying application called "The Sketch Project." You switch between them naturally based on context.

CHARACTER 1 — "The Sketch" (Field Book)
- A no-nonsense land surveyor instrument. Thinks in coordinates, bearings, azimuths, and distances.
- Speaks concisely. Uses surveying terminology naturally.
- When given coordinate data or traverse commands, responds with precision.
- Example tone: "Bearing N45°30'E, distance 150.00. Point set."

CHARACTER 2 — "The Notepad" (Conveyer)
- The companion. More conversational, curious, and supportive.
- Helps organize thoughts, asks clarifying questions, and remembers context.
- When the user writes freeform text, the Notepad engages.
- Example tone: "Got it — that parcel boundary looks like it wraps around to the southeast. Want me to note the tie-in point?"

RULES:
- Keep responses short and practical. This is a work tool, not a novel.
- If coordinates or survey data are present in the conversation, The Sketch leads.
- If the message is freeform notes or questions, The Notepad leads.
- Prefix your response with [Sketch] or [Notepad] so the UI knows which character is speaking.
- You can reference prior context from the conversation history.
- Never fabricate coordinate data. If you don't have real values, say so.`;

// --- Session State ---

let chatSession = null;
let conversationHistory = [];

/**
 * Initialize the conversation engine. Call this once at app startup.
 * @param {string} apiKey - Your Google Generative AI API key
 * @returns {boolean} Whether the engine is ready
 */
export function initConversation(apiKey) {
    const ready = initGemini(apiKey);
    
    if (!ready) {
        console.warn('⚠️ [Conversation] AI not available — conversation engine is dormant.');
        return false;
    }

    chatSession = startChat({
        systemInstruction: SYSTEM_INSTRUCTION,
        history: []
    });

    if (chatSession) {
        console.log('💬 [Conversation] Engine initialized — Sketch & Notepad are ready.');
        return true;
    }

    return false;
}

/**
 * Send a message to the AI and get a character response.
 * @param {string} userMessage - The user's message text
 * @returns {Promise<Object>} Response with character, text, and timestamp
 */
export async function chat(userMessage) {
    if (!userMessage || typeof userMessage !== 'string') {
        return { success: false, message: 'Empty or invalid message.' };
    }

    if (!chatSession || !isGeminiAvailable()) {
        return { 
            success: false, 
            message: 'AI conversation engine is not active. Check your API key.',
            fallback: true
        };
    }

    try {
        // Inject current coordinate context so the AI knows what's on the canvas
        const contextPrefix = _buildContextPrefix();
        const fullMessage = contextPrefix ? `${contextPrefix}\n\nUser: ${userMessage}` : userMessage;

        const result = await chatSession.sendMessage(fullMessage);
        const responseText = result.response.text();

        // Parse which character is speaking
        const character = responseText.startsWith('[Sketch]') ? 'sketch' : 'notepad';
        const cleanText = responseText.replace(/^\[(Sketch|Notepad)\]\s*/i, '').trim();

        // Store in conversation history
        const entry = {
            timestamp: new Date().toISOString(),
            userMessage: userMessage,
            aiResponse: cleanText,
            character: character
        };

        conversationHistory.push(entry);

        // Sync to globalState for persistence
        if (!globalState.conversation) {
            globalState.conversation = [];
        }
        globalState.conversation.push(entry);

        return {
            success: true,
            character,
            text: cleanText,
            timestamp: entry.timestamp
        };
    } catch (error) {
        console.error('❌ [Conversation] Chat error:', error.message);
        return { success: false, message: error.message };
    }
}

/**
 * Get the full conversation history for this session
 * @returns {Array} Array of conversation entries
 */
export function getHistory() {
    return [...conversationHistory];
}

/**
 * Clear the current chat session and start fresh
 */
export function clearSession() {
    conversationHistory = [];
    
    if (globalState.conversation) {
        globalState.conversation = [];
    }

    if (isGeminiAvailable()) {
        chatSession = startChat({
            systemInstruction: SYSTEM_INSTRUCTION,
            history: []
        });
        console.log('🔄 [Conversation] Session cleared — fresh start.');
    }
}

/**
 * Build a context string from the current coordinate state
 * so the AI knows what's currently on the canvas.
 * @private
 * @returns {string} Context prefix or empty string
 */
function _buildContextPrefix() {
    const coords = globalState.coordinates;
    const notes = globalState.notes;
    const parts = [];

    if (coords && coords.length > 0) {
        const last3 = coords.slice(-3);
        parts.push(`[Active coordinates — last ${last3.length} points: ${JSON.stringify(last3)}]`);
    }

    if (notes && notes.length > 0) {
        const lastNote = notes.at(-1);
        parts.push(`[Latest field note: "${lastNote.text}"]`);
    }

    return parts.length > 0 ? `[CONTEXT]\n${parts.join('\n')}` : '';
}
