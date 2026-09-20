/*
 * COMP 4537 - Lab 2: JSON, Object Constructor, localStorage
 * AI disclosure: this file was written with the help of Claude (Anthropic), an AI assistant.
 */

import { Note } from "./Note.js";
import { AppButton } from "./AppButton.js";
import { StatusLabel } from "./StatusLabel.js";
import { MESSAGES } from "../lang/messages/en/user.js";

// Builds and runs the writer page. Holds the array of Note objects and saves it to
// storage the moment anything changes, rather than on a timer.
export class WriterApp {
    static INDEX_URL = "index.html";
    static FIRST_ID = 1;

    constructor(root, store) {
        this.root = root;
        this.store = store;
        this.notes = [];
        this.nextId = WriterApp.FIRST_ID;
        this.status = new StatusLabel();
        this.noteList = document.createElement("div");
        this.noteList.className = "note-list";
    }

    start() {
        document.title = MESSAGES.WRITER_TITLE;
        this.status.mount(this.root);

        const heading = document.createElement("h1");
        heading.textContent = MESSAGES.WRITER_TITLE;
        this.root.appendChild(heading);

        this.root.appendChild(this.noteList);

        // The add button sits after the list, so every new note pushes it further down
        const addButton = new AppButton(MESSAGES.ADD_BUTTON, "add-button");
        addButton.onClick(() => this.addNote());
        addButton.mount(this.root);

        const backRow = document.createElement("div");
        backRow.className = "back-row";
        this.root.appendChild(backRow);

        const backButton = new AppButton(MESSAGES.BACK_BUTTON, "back-button");
        backButton.onClick(() => {
            window.location.href = WriterApp.INDEX_URL;
        });
        backButton.mount(backRow);

        this.loadExistingNotes();
    }

    // Rebuilds a textarea for every note already in storage, so the user can edit them
    loadExistingNotes() {
        for (const stored of this.store.load()) {
            this.createNote(stored.id, stored.text);
            if (stored.id >= this.nextId) {
                this.nextId = stored.id + 1;
            }
        }
    }

    createNote(id, text) {
        const note = new Note(id, text);
        note.onInput(() => this.save());
        note.onRemove((target) => this.removeNote(target));
        note.mount(this.noteList);
        this.notes.push(note);
        return note;
    }

    addNote() {
        this.createNote(this.nextId, "");
        this.nextId += 1;
        this.save();
    }

    // Drops the note from the array and the page, then writes the shorter array out
    // immediately so its contents leave localStorage at once
    removeNote(note) {
        this.notes = this.notes.filter((candidate) => candidate !== note);
        note.remove();
        this.save();
    }

    save() {
        this.store.save(this.notes.map((note) => note.getData()));
        this.status.showNow(MESSAGES.STORED_AT);
    }
}
