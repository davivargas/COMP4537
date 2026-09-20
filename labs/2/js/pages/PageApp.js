/*
 * COMP 4537 - Lab 2: JSON, Object Constructor, localStorage
 * AI disclosure: this file was written with the help of Claude (Anthropic), an AI assistant.
 */

import { AppButton } from "../widgets/AppButton.js";
import { StatusLabel } from "../widgets/StatusLabel.js";
import { MESSAGES } from "../../lang/messages/en/user.js";

// What the writer page and the reader page have in common: the title, the status
// line, the heading, the list the notes go in and the button back to the index.
// start() fixes the order all of that is built in, and a subclass fills in only
// buildContent(), which is the one part the two pages do not share.
export class PageApp {
    static INDEX_URL = "index.html";

    constructor(root, store, title) {
        this.root = root;
        this.store = store;
        this.title = title;
        this.notes = [];
        this.status = new StatusLabel();
        this.noteList = document.createElement("div");
        this.noteList.className = "note-list";
    }

    start() {
        document.title = this.title;
        this.status.mount(this.root);

        const heading = document.createElement("h1");
        heading.textContent = this.title;
        this.root.appendChild(heading);

        this.root.appendChild(this.noteList);

        // Whatever the subclass adds lands between the list and the back button
        this.buildContent();

        const backRow = document.createElement("div");
        backRow.className = "back-row";
        this.root.appendChild(backRow);

        new AppButton(MESSAGES.BACK_BUTTON, "back-button")
            .onClick(() => {
                window.location.href = PageApp.INDEX_URL;
            })
            .mount(backRow);
    }

    // Filled in by the subclass. A bare page has nothing of its own to add.
    buildContent() {
    }
}
