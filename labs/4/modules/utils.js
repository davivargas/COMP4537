/*
 * COMP 4537 - Lab 4
 * AI disclosure: this file was written with the help of Claude (Anthropic), an AI assistant.
 */

const fs = require("fs");
const path = require("path");
const MESSAGES = require("../lang/en/en");

// Helpers shared by the routes: building the date message and escaping user text
class Utils {
    // Fills %1, %2, ... in a message with the given values
    static format(message, ...values) {
        return values.reduce((text, value, i) => text.replace(`%${i + 1}`, value), message);
    }

    // Escapes user input so it can be safely placed inside HTML
    static escapeHtml(text) {
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    // Greets the user and returns the current date and time of the server
    static getDate(name) {
        return Utils.format(MESSAGES.GREETING, name) + new Date().toString();
    }
}

// Appends to and reads from text files kept in one folder on the server
class FileStore {
    constructor(directory) {
        this.directory = directory;
    }

    // Only the base name is used so a request cannot reach outside the folder
    resolve(fileName) {
        return path.join(this.directory, path.basename(fileName));
    }

    // appendFile creates the file when it does not exist yet
    append(fileName, text, callback) {
        fs.mkdir(this.directory, { recursive: true }, (err) => {
            if (err) {
                callback(err);
                return;
            }
            fs.appendFile(this.resolve(fileName), text + "\n", callback);
        });
    }

    read(fileName, callback) {
        fs.readFile(this.resolve(fileName), "utf8", callback);
    }
}

module.exports = { Utils, FileStore };
