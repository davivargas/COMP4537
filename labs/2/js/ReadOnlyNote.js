/*
 * COMP 4537 - Lab 2: JSON, Object Constructor, localStorage
 * AI disclosure: this file was written with the help of Claude (Anthropic), an AI assistant.
 */

// One note as the reader page shows it: the text only, with nothing to edit or remove.
export class ReadOnlyNote {
    static CLASS_NAME = "read-note";

    constructor(text) {
        this.element = document.createElement("div");
        this.element.className = ReadOnlyNote.CLASS_NAME;
        this.element.textContent = text;
    }

    mount(parent) {
        parent.appendChild(this.element);
        return this;
    }

    remove() {
        this.element.remove();
    }
}
