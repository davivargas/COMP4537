/*
 * COMP 4537 - Lab 2: JSON, Object Constructor, localStorage
 * AI disclosure: this file was written with the help of Claude (Anthropic), an AI assistant.
 */

import { Widget } from "./Widget.js";
import { AppButton } from "./AppButton.js";
import { MESSAGES } from "../lang/messages/en/user.js";

// The editable view of one NoteData: a textarea to change its text and a button to
// remove it. The NoteData behind it is kept up to date on every keystroke, so the
// writer page can hand the models straight to the store without converting anything.
// Nothing outside this class reaches into the textarea.
export class Note extends Widget {
    static ROW_CLASS = "note-row";
    static TEXT_CLASS = "note-text";
    static REMOVE_CLASS = "remove-button";

    constructor(data) {
        super("div", Note.ROW_CLASS);
        this.data = data;

        this.textarea = document.createElement("textarea");
        this.textarea.className = Note.TEXT_CLASS;
        this.textarea.value = data.text;
        this.element.appendChild(this.textarea);

        this.removeButton = new AppButton(MESSAGES.REMOVE_BUTTON, Note.REMOVE_CLASS);
        this.removeButton.mount(this.element);
    }

    // Copies the typing into the model first, then tells the page to save. One
    // listener does both, so the two can never happen out of order.
    onInput(handler) {
        this.textarea.addEventListener("input", () => {
            this.data.text = this.textarea.value;
            handler();
        });
    }

    // Hands this whole Note to the handler so the writer knows which one to drop
    onRemove(handler) {
        this.removeButton.onClick(() => handler(this));
    }
}
