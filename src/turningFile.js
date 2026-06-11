/** @import { ConversationEntry } from "./ai/conversationEngine.js" */

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
 * @property {TraverseVector[]} traverseVectors - To store raw parsed inputs
 * @property {Coordinate[]} coordinates        - To store calculated/resolved points
 * @property {ParcelFieldNote[]} notes         - To store text logs
 * @property {any[]} parcels
 * @property {ConversationEntry[]} conversation
 */

/** @type {AppState} */
export const globalState = {
    traverseVectors: [],
    coordinates: [],
    notes: [],
    parcels: [],
    conversation: []
};