/** @import { ConversationEntry } from "./ai/conversationEngine.js" */

/**
 * @typedef {Object} ExtractedVector
 * @property {string} type
 * @property {number} azimuth
 * @property {number} distance
 * @property {string} timestamp
 */

/**
 * @typedef {Object} TraverseVector
 * @property {string} type
 * @property {number} azimuth
 * @property {number} distance
 * @property {string} timestamp
 */

/**
 * @typedef {Object} Coordinate
 * @property {number} x
 * @property {number} y
 * @property {string} [timestamp]
 */

/**
 * @typedef {Object} ParcelFieldNote
 * @property {string} timestamp
 * @property {string} parcelID
 * @property {string} text
 */

/**
 * @typedef {Object} AppState
 * @property {ExtractedVector[]} extractedVectors
 * @property {TraverseVector[]} traverseVectors
 * @property {Coordinate[]} coordinates
 * @property {ParcelFieldNote[]} notes
 * @property {any[]} parcels
 * @property {ConversationEntry[]} conversation
 */

/** @type {AppState} */
export const globalState = {
    extractedVectors: [],
    traverseVectors: [],
    coordinates: [],
    notes: [],
    parcels: [],
    conversation: []
};