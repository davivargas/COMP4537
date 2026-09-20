/*
 * COMP 4537 - Lab 2: JSON, Object Constructor, localStorage
 * AI disclosure: this file was written with the help of Claude (Anthropic), an AI assistant.
 */

import { PageApp } from "./PageApp.js";
import { ReadOnlyNote } from "./ReadOnlyNote.js";
import { MESSAGES } from "../lang/messages/en/user.js";

// The reader page. It reads once when the page opens and again every time another
// tab changes the stored notes, so it stays current without a refresh.
export class ReaderApp extends PageApp {
    constructor(root, store) {
        super(root, store, MESSAGES.READER_TITLE);

        this.emptyMessage = document.createElement("p");
        this.emptyMessage.className = "empty-message";
        this.emptyMessage.textContent = MESSAGES.NO_NOTES;
    }

    buildContent() {
        this.refresh();
        this.store.onExternalChange(() => this.refresh());
    }

    // Throws away the notes on screen and rebuilds them from what is in storage now
    refresh() {
        for (const note of this.notes) {
            note.remove();
        }
        this.notes = [];
        this.emptyMessage.remove();

        const stored = this.store.load();
        for (const data of stored) {
            this.notes.push(new ReadOnlyNote(data.text).mount(this.noteList));
        }

        if (stored.length === 0) {
            this.noteList.appendChild(this.emptyMessage);
        }

        this.status.showNow(MESSAGES.UPDATED_AT);
    }
}
