/*
 * COMP 4537 - Lab 2: JSON, Object Constructor, localStorage
 * AI disclosure: this file was written with the help of Claude (Anthropic), an AI assistant.
 *
 * Starting point for index.html: the title, the student name and the two buttons
 * that lead to the writer and reader pages.
 */

import { AppButton } from "./AppButton.js";
import { MESSAGES } from "../lang/messages/en/user.js";

const WRITER_URL = "writer.html";
const READER_URL = "reader.html";

// Makes one navigation button and puts it in the given row
const addNavButton = (row, label, url) => {
    const button = new AppButton(label, "nav-button");
    button.onClick(() => {
        window.location.href = url;
    });
    button.mount(row);
};

document.title = MESSAGES.INDEX_TITLE;

const heading = document.createElement("h1");
heading.textContent = MESSAGES.INDEX_TITLE;
document.body.appendChild(heading);

const studentName = document.createElement("p");
studentName.className = "student-name";
studentName.textContent = MESSAGES.STUDENT_NAME;
document.body.appendChild(studentName);

const navRow = document.createElement("div");
navRow.className = "nav-row";
document.body.appendChild(navRow);

addNavButton(navRow, MESSAGES.WRITER_TITLE, WRITER_URL);
addNavButton(navRow, MESSAGES.READER_TITLE, READER_URL);
