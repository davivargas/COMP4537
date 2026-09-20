/*
 * COMP 4537 - Lab 2: JSON, Object Constructor, localStorage
 * AI disclosure: this file was written with the help of Claude (Anthropic), an AI assistant.
 */

import { AppButton } from "./AppButton.js";
import { MESSAGES } from "../lang/messages/en/user.js";

// The front page: the title, the student name and the two buttons that lead to the
// writer and the reader. It has no notes and no store of its own, so it does not
// extend PageApp, it only shares the AppButton the other pages use.
export class IndexApp {
    static WRITER_URL = "writer.html";
    static READER_URL = "reader.html";

    constructor(root) {
        this.root = root;
        this.navRow = document.createElement("div");
        this.navRow.className = "nav-row";
    }

    start() {
        document.title = MESSAGES.INDEX_TITLE;

        const heading = document.createElement("h1");
        heading.textContent = MESSAGES.INDEX_TITLE;
        this.root.appendChild(heading);

        const studentName = document.createElement("p");
        studentName.className = "student-name";
        studentName.textContent = MESSAGES.STUDENT_NAME;
        this.root.appendChild(studentName);

        this.root.appendChild(this.navRow);

        this.addNavButton(MESSAGES.WRITER_TITLE, IndexApp.WRITER_URL);
        this.addNavButton(MESSAGES.READER_TITLE, IndexApp.READER_URL);
    }

    // Makes one navigation button and puts it in the row
    addNavButton(label, url) {
        new AppButton(label, "nav-button")
            .onClick(() => {
                window.location.href = url;
            })
            .mount(this.navRow);
    }
}
