/*
 * COMP 4537 - Lab 2: JSON, Object Constructor, localStorage
 * AI disclosure: this file was written with the help of Claude (Anthropic), an AI assistant.
 */

import { AppButton } from "./AppButton.js";
import { MESSAGES } from "../lang/messages/en/user.js";

// One editable note on the writer page. Each Note owns its own textarea and its own
// remove button, and knows how to hand back its data and how to take itself out of
// the page. Nothing outside this class reaches into those elements.
export class Note {
    static ROW_CLASS = "note-row";
    static TEXT_CLASS = "note-text";
    static REMOVE_CLASS = "remove-button";

    constructor(id, text) {
        this.id = id;

        this.element = document.createElement("div");
        this.element.className = Note.ROW_CLASS;

        this.textarea = document.createElement("textarea");
        this.textarea.className = Note.TEXT_CLASS;
        this.textarea.value = text;
        this.element.appendChild(this.textarea);

        this.removeButton = new AppButton(MESSAGES.REMOVE_BUTTON, Note.REMOVE_CLASS);
        this.removeButton.mount(this.element);
    }

    // The plain object that gets serialized into localStorage
    getData() {
        return { id: this.id, text: this.textarea.value };
    }

    // Runs handler on every keystroke, which is what saves instead of a timer
    onInput(handler) {
        this.textarea.addEventListener("input", handler);
    }

    // Hands this whole Note to the handler so the writer knows which one to drop
    onRemove(handler) {
        this.removeButton.onClick(() => handler(this));
    }

    mount(parent) {
        parent.appendChild(this.element);
        return this;
    }

    // Removing the row takes the textarea and its remove button with it
    remove() {
        this.element.remove();
    }
}
