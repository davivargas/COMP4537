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

    // Stamps the given time after the message, e.g. "Stored at 2:31:07 PM". The
    // time is passed in so the writer can report a save that happened before the
    // page was even opened.
    show(message, time) {
        this.element.textContent = message + time.toLocaleTimeString();
    }

    showNow(message) {
        this.show(message, new Date());
    }
}
