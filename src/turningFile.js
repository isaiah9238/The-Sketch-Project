/** @import { ConversationEntry } from "./ai/conversationEngine.js" */

/**
 * @typedef {Object} Coordinate
 * @property {number} x
 * @property {number} y
 * @property {string} [timestamp]
 */

/**
 * @typedef {Object} FieldNote
 * @property {string} sourceId
 * @property {string} text
 * @property {string} timestamp
 */

/**
 * @typedef {Object} Conversation
 * @property {string} timestamp
 * @property {string} userMessage
 * @property {string} aiResponse
 * @property {string} character
 */

/**
 * @typedef {Object} Entry
 * @property {string} timestamp
 * @property {string} userMessage
 * @property {string} aiResponse
 * @property {string} character
 */

/**
 * @typedef {Object} AppState
 * @property {FieldNote[]} notes
 * @property {Coordinate[]} coordinates
 * @property {any[]} parcels
 * @property {ConversationEntry[]} conversation
 */

/** @type {AppState} */
export const globalState = {
    notes: [],
    coordinates: [],
    parcels: [],
    conversation: []
};