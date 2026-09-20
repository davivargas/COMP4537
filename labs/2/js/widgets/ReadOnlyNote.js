/*
 * COMP 4537 - Lab 2: JSON, Object Constructor, localStorage
 * AI disclosure: this file was written with the help of Claude (Anthropic), an AI assistant.
 */

import { Widget } from "./Widget.js";

// One note as the reader page shows it: the text only, with nothing to edit or remove.
export class ReadOnlyNote extends Widget {
    static CLASS_NAME = "read-note";

    constructor(text) {
        super("div", ReadOnlyNote.CLASS_NAME);
        this.element.textContent = text;
    }
}
