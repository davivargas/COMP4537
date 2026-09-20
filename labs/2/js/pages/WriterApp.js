/*
 * COMP 4537 - Lab 2: JSON, Object Constructor, localStorage
 * AI disclosure: this file was written with the help of Claude (Anthropic), an AI assistant.
 */

import { PageApp } from "./PageApp.js";
import { Note } from "../widgets/Note.js";
import { NoteData } from "../data/NoteData.js";
import { AppButton } from "../widgets/AppButton.js";
import { MESSAGES } from "../../lang/messages/en/user.js";

// The writer page. It holds one Note for every stored NoteData and writes the whole
// list back to storage the moment anything changes, rather than on a timer.
export class WriterApp extends PageApp {
    constructor(root, store) {
        super(root, store, MESSAGES.WRITER_TITLE);
    }

    buildContent() {
        // The add button sits after the list, so every new note pushes it further down
        new AppButton(MESSAGES.ADD_BUTTON, "add-button")
            .onClick(() => this.addNote())
            .mount(this.root);

        // A textarea for every note already in storage, so the user can edit them
        for (const data of this.store.load()) {
            this.createNote(data);
        }
    }

    // The models behind the notes on screen, in the order they appear
    noteData() {
        return this.notes.map((note) => note.data);
    }

    createNote(data) {
        const note = new Note(data);
        note.onInput(() => this.save());
        note.onRemove((target) => this.removeNote(target));
        note.mount(this.noteList);
        this.notes.push(note);
        return note;
    }

    addNote() {
        this.createNote(new NoteData(NoteData.nextId(this.noteData()), ""));
        this.save();
    }

    // Drops the note from the array and the page, then writes the shorter list out
    // immediately so its contents leave localStorage at once
    removeNote(note) {
        this.notes = this.notes.filter((candidate) => candidate !== note);
        note.remove();
        this.save();
    }

    save() {
        this.store.save(this.noteData());
        this.status.showNow(MESSAGES.STORED_AT);
    }
}
