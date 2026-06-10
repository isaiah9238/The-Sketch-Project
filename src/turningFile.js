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
 * @typedef {Object} AppState
 * @property {FieldNote[]} notes
 * @property {Coordinate[]} coordinates
 * @property {any[]} parcels
 */

/** @type {AppState} */
export const globalState = {
    notes: [],
    coordinates: [],
    parcels: []
};