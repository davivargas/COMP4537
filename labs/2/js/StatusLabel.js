/*
 * COMP 4537 - Lab 2: JSON, Object Constructor, localStorage
 * AI disclosure: this file was written with the help of Claude (Anthropic), an AI assistant.
 */

// The small line of text in the top right corner that reports the most recent
// time the notes were stored (writer) or retrieved (reader).
export class StatusLabel {
    static CLASS_NAME = "status";

    constructor() {
        this.element = document.createElement("div");
        this.element.className = StatusLabel.CLASS_NAME;
    }

    mount(parent) {
        parent.appendChild(this.element);
        return this;
    }

    // Stamps the current time after the given message, e.g. "Stored at 2:31:07 PM"
    showNow(message) {
        this.element.textContent = message + new Date().toLocaleTimeString();
    }
}
