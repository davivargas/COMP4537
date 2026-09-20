/*
 * COMP 4537 - Lab 2: JSON, Object Constructor, localStorage
 * AI disclosure: this file was written with the help of Claude (Anthropic), an AI assistant.
 */

import { NoteData } from "./NoteData.js";

// The only class that touches localStorage. It turns the notes into a JSON string on
// the way in and back into NoteData objects on the way out, so the writer page and
// the reader page can never disagree about the stored format.
export class NoteStore {
    static KEY = "comp4537_lab2_notes";

    // Takes NoteData objects; JSON.stringify calls toJSON() on each one of them
    save(notes) {
        localStorage.setItem(NoteStore.KEY, JSON.stringify(notes));
    }

    // Always returns an array of NoteData, even if nothing has been stored yet or
    // what is there is not what we wrote
    load() {
        const raw = localStorage.getItem(NoteStore.KEY);
        if (raw === null) {
            return [];
        }
        let parsed;
        try {
            parsed = JSON.parse(raw);
        } catch (error) {
            return [];
        }
        if (!Array.isArray(parsed)) {
            return [];
        }
        return parsed
            .map((item) => NoteData.fromJSON(item))
            .filter((note) => note !== null);
    }

    // The storage event fires in every OTHER tab of this browser when our key changes.
    // That is what lets the reader page update the instant the writer page saves,
    // without the user refreshing anything. It never fires in the tab that did the
    // writing, so the writer cannot trigger itself in a loop.
    onExternalChange(handler) {
        window.addEventListener("storage", (event) => {
            // event.key is null when the whole storage area is cleared at once
            if (event.key === NoteStore.KEY || event.key === null) {
                handler();
            }
        });
    }
}
