/*
 * COMP 4537 - Lab 4
 * AI disclosure: this file was written with the help of Claude (Anthropic), an AI assistant.
 *
 * Every string the user can see lives here. %1, %2 are replaced at runtime.
 */

const MESSAGES = {
    GREETING: "Hello %1, What a beautiful day. Server current date and time is ",
    MISSING_NAME: "Please provide your name, e.g. ?name=John",
    MISSING_TEXT: "Please provide the text to write, e.g. ?text=BCIT",
    WRITE_SUCCESS: "\"%1\" was appended to %2",
    FILE_NOT_FOUND: "404 Not Found: the file \"%1\" does not exist",
    ROUTE_NOT_FOUND: "404 Not Found",
    SERVER_ERROR: "500 Internal Server Error",
    LISTENING: "Server listening on port %1"
};

module.exports = MESSAGES;
