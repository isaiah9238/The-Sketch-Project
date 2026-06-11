/**
 * Conveyer Notepad Engine
 * Handles volatile notes, visual dissolving effects, and split/merge architecture.
 */

import { globalState } from '../../turningFile.js';
import AICore from './aiCore.js';
import { initConversation, chat as aiChat, isGeminiAvailable } from '../../ai/conversationEngine.js';

export default class Notepad {
    /**
     * Create a new Notepad instance
     * @param {string} id - Unique identifier for this notepad instance
     */
    constructor(id = 'root') {
        this.id = id;
        /** @type {string} */
        this.content = "";
        /** @type {Notepad[]} */
        this.children = [];
        /** @type {HTMLTextAreaElement | null} */
        this.domElement = null;
        /** @type {boolean} */
        this.isTranslucent = false;
        /** @type {AICore} */
        this.aiCore = new AICore(); // Local AI instance for "Sparking Ideas"
        /** @type {ReturnType<typeof setTimeout> | null} */
        this.typingTimeout = null;
        /** @type {boolean} */
        this.isAiTyping = false; // Flag to prevent infinite AI reflection loops
    }

    /**
     * Binds this notepad to a specific DOM textarea element
     * @param {HTMLTextAreaElement} element 
     */
    bindUI(element) {
        this.domElement = element;
        this.domElement.value = this.content;

        // Listen to changes
        this.domElement.addEventListener('input', (e) => {
            const target = /** @type {HTMLTextAreaElement} */ (e.target);
            this.content = target.value;
            this._handleAutoSpark();
        });
    }

    /**
     * Volatile Notes: Gradually fades out text
     * @param {number} duration - Dissolve duration in milliseconds
     * @param {boolean} keepDissolved - If true, text stays dissolved and is not cleared automatically
     */
    dissolveText(duration = 2000, keepDissolved = false) {
        if (!this.domElement) return;

        // Apply visual dissolving effect
        this.domElement.style.transition = `opacity ${duration}ms ease-out, filter ${duration}ms ease-out`;
        this.domElement.style.opacity = '0';
        this.domElement.style.filter = 'blur(4px)';

        setTimeout(() => {
            if (!keepDissolved) {
                this.clear();
                // Reset visuals after dissolving
                this.domElement.style.opacity = '1';
                this.domElement.style.filter = 'none';
                this.domElement.style.transition = '';
            }
        }, duration);
    }

    /**
     * Restores text that was permanently dissolved
     */
    restoreText() {
        if (!this.domElement) return;
        this.domElement.style.opacity = '1';
        this.domElement.style.filter = 'none';
        this.domElement.style.transition = 'opacity 500ms ease-in, filter 500ms ease-in';
    }

    /**
     * Clears the current content of the notepad
     */
    clear() {
        this.content = "";
        if (this.domElement) {
            this.domElement.value = "";
        }
    }

    /**
     * Fluid Architecture: Splits this notepad into a new independent instance
     * @returns {Notepad} The new child notepad
     */
    split() {
        const childId = `${this.id}_sub_${Date.now()}`;
        const childNotepad = new Notepad(childId);
        this.children.push(childNotepad);
        console.log(`[Notepad] Split created instance: ${childId}`);
        return childNotepad;
    }

    /**
     * Fluid Architecture: Merges a child notepad back into this root utility without data loss
     * @param {Notepad} childNotepad 
     */
    merge(childNotepad) {
        const index = this.children.indexOf(childNotepad);
        if (index > -1) {
            if (childNotepad.content.trim()) {
                const separator = this.content ? '\n---\n' : '';
                this.content += separator + childNotepad.content;
                if (this.domElement) {
                    this.domElement.value = this.content;
                }
                this._commitToState();
            }
            this.children.splice(index, 1);
            console.log(`[Notepad] Merged instance: ${childNotepad.id} into ${this.id}`);
        }
    }

    /**
     * Toggles translucency of the docked window for unobtrusive background presence
     */
    toggleTranslucency() {
        if (!this.domElement) return;
        this.isTranslucent = !this.isTranslucent;
        this.domElement.style.opacity = this.isTranslucent ? '0.4' : '1.0';
    }

    /**
     * Commits the current content to the unified global state safely
     */
    _commitToState() {
        if (!this.content.trim()) return;

        // Check if an entry for this specific notepad instance already exists to avoid array bloat
        const existingNoteIdx = globalState.notes.findIndex(n => n.sourceId === this.id);

        const notePayload = {
            timestamp: new Date().toISOString(),
            text: this.content.trim(),
            sourceId: this.id
        };

        if (existingNoteIdx > -1) {
            globalState.notes[existingNoteIdx] = notePayload; // Update existing entry
        } else {
            globalState.notes.push(notePayload); // Fresh entry
        }
    }

    /**
     * Process current content through the AI Core
     */
    processContent() {
        if (!this.content.trim()) return null;
        this._commitToState();
        return this.aiCore.processInput(this.content);
    }

    /**
     * Chat interface: Appends a system/AI message to the notepad
     * @param {string} message - The message from the AI or system
     */
    appendChatMessage(message) {
        this.isAiTyping = true; // Set flag to block self-triggering
        const chatPrefix = "\n🤖 [Conveyer]: ";
        this.content += chatPrefix + message + "\n";

        if (this.domElement) {
            this.domElement.value = this.content;
            this.domElement.scrollTop = this.domElement.scrollHeight;
        }

        this._commitToState();
        this.isAiTyping = false; // Reset loop guard flag
    }

    /**
     * AI Co-Pilot ("Sparking Ideas"): Continuous analysis of active notes
     * @private
     */
    _handleAutoSpark() {
        if (this.isAiTyping) return; // Prevent the AI from triggering its own scanner loop
        if (this.typingTimeout) clearTimeout(this.typingTimeout);

        this.typingTimeout = setTimeout(async () => {
            if (this.content.trim().length > 10) {
                console.log(`[Notepad AI] Sparking ideas for: ${this.id}...`);
                
                // Send through the conversation engine if AI is available
                const response = await aiChat(this.content);
                if (response && response.success && response.text) {
                    const prefix = response.character === 'sketch' ? '📐' : '📝';
                    this.appendChatMessage(`${prefix} ${response.text}`);
                }
            }
        }, 1500);
    }
}