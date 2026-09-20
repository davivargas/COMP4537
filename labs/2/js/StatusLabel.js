/*
 * COMP 4537 - Lab 2: JSON, Object Constructor, localStorage
 * AI disclosure: this file was written with the help of Claude (Anthropic), an AI assistant.
 */

import { Widget } from "./Widget.js";

// The small line of text in the top right corner that reports the most recent
// time the notes were stored (writer) or retrieved (reader).
export class StatusLabel extends Widget {
    static CLASS_NAME = "status";

    constructor() {
        super("div", StatusLabel.CLASS_NAME);
    }

    // Stamps the current time after the given message, e.g. "Stored at 2:31:07 PM"
    showNow(message) {
        this.element.textContent = message + new Date().toLocaleTimeString();
    }
}
