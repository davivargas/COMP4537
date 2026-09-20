/*
 * COMP 4537 - Lab 2: JSON, Object Constructor, localStorage
 * AI disclosure: this file was written with the help of Claude (Anthropic), an AI assistant.
 */

import { ReaderApp } from "./ReaderApp.js";
import { NoteStore } from "./NoteStore.js";

// Starting point for reader.html
new ReaderApp(document.body, new NoteStore()).start();
