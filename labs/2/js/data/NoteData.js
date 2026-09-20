/*
 * COMP 4537 - Lab 2: JSON, Object Constructor, localStorage
 * AI disclosure: this file was written with the help of Claude (Anthropic), an AI assistant.
 */

// One note as data: the part that is actually stored. It exists without any element
// on the page, which is what lets the same note travel from the writer, through
// localStorage, to the reader without either page inventing its own shape for it.
export class NoteData {
    constructor(id, text) {
        this.id = id;
        this.text = text;
    }

    // Rebuilds a note from one entry of the parsed JSON, or returns null when that
    // entry is not a note at all. localStorage can be emptied or edited by hand, so
    // nothing coming back out of it is taken on trust.
    static fromJSON(raw) {
        if (raw === null || typeof raw !== "object") {
            return null;
        }
        if (!Number.isInteger(raw.id)) {
            return null;
        }
        const text = typeof raw.text === "string" ? raw.text : "";
        return new NoteData(raw.id, text);
    }

    // One past the largest id in the list, so a new note never reuses an id and no
    // counter has to be stored alongside the notes
    static nextId(notes) {
        return notes.reduce((highest, note) => Math.max(highest, note.id), 0) + 1;
    }

    // JSON.stringify calls this by itself, so the store never has to convert anything
    toJSON() {
        return { id: this.id, text: this.text };
    }
}
