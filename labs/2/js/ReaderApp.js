/*
 * COMP 4537 - Lab 2: JSON, Object Constructor, localStorage
 * AI disclosure: this file was written with the help of Claude (Anthropic), an AI assistant.
 */

import { ReadOnlyNote } from "./ReadOnlyNote.js";
import { AppButton } from "./AppButton.js";
import { StatusLabel } from "./StatusLabel.js";
import { MESSAGES } from "../lang/messages/en/user.js";

// Builds and runs the reader page. It reads once when the page opens and again every
// time another tab changes the stored notes, so it stays current without a refresh.
export class ReaderApp {
    static INDEX_URL = "index.html";

    constructor(root, store) {
        this.root = root;
        this.store = store;
        this.notes = [];
        this.status = new StatusLabel();
        this.noteList = document.createElement("div");
        this.noteList.className = "note-list";
        this.emptyMessage = document.createElement("p");
        this.emptyMessage.className = "empty-message";
        this.emptyMessage.textContent = MESSAGES.NO_NOTES;
    }

    start() {
        document.title = MESSAGES.READER_TITLE;
        this.status.mount(this.root);

        const heading = document.createElement("h1");
        heading.textContent = MESSAGES.READER_TITLE;
        this.root.appendChild(heading);

        this.root.appendChild(this.noteList);

        const backRow = document.createElement("div");
        backRow.className = "back-row";
        this.root.appendChild(backRow);

        const backButton = new AppButton(MESSAGES.BACK_BUTTON, "back-button");
        backButton.onClick(() => {
            window.location.href = ReaderApp.INDEX_URL;
        });
        backButton.mount(backRow);

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
        for (const item of stored) {
            const note = new ReadOnlyNote(item.text);
            note.mount(this.noteList);
            this.notes.push(note);
        }

        if (stored.length === 0) {
            this.noteList.appendChild(this.emptyMessage);
        }

        this.status.showNow(MESSAGES.UPDATED_AT);
    }
}
