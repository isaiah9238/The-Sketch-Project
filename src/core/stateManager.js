/** @import { ConversationEntry } from "../ai/conversationEngine.js" */

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
 * @typedef {Object} UserSession
 * @property {string} uid
 * @property {string | null} email
 * @property {string | null} displayName
 */

/**
 * @typedef {Object} AppState
 * @property {ExtractedVector[]} extractedVectors
 * @property {TraverseVector[]} traverseVectors
 * @property {Coordinate[]} coordinates
 * @property {ParcelFieldNote[]} notes
 * @property {any[]} parcels
 * @property {ConversationEntry[]} conversation
 * @property {UserSession | null} user
 */

class StateStore {
    constructor() {
        /** @type {AppState} */
        this.state = {
            extractedVectors: [],
            traverseVectors: [],
            coordinates: [],
            notes: [],
            parcels: [],
            conversation: [],
            user: null
        };
        
        /** @type {Set<Function>} */
        this.listeners = new Set();
    }

    /**
     * Subscribes to state changes.
     * @param {Function} callback 
     * @returns {Function} Unsubscribe function
     */
    subscribe(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    /**
     * Updates the state and notifies all subscribers.
     * @param {Partial<AppState>} partialState 
     */
    setState(partialState) {
        Object.assign(this.state, partialState);
        this.listeners.forEach(cb => cb(this.state));
    }
}

export const stateManager = new StateStore();

/** 
 * A reactive proxy around the core state. 
 * Mutating globalState.propertyName = value automatically triggers subscriber updates.
 * @type {AppState} 
 */
export const globalState = new Proxy(/** @type {any} */ (stateManager.state), {
    get: (target, prop) => target[prop],
    set: (target, prop, value) => {
        target[prop] = value;
        stateManager.listeners.forEach(cb => cb(stateManager.state));
        return true;
    }
});