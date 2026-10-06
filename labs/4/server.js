/*
 * COMP 4537 - Lab 4: Part B (getDate) and Part C (writeFile / readFile)
 * AI disclosure: this file was written with the help of Claude (Anthropic), an AI assistant.
 */

const http = require("http");
const path = require("path");
const { Utils, FileStore } = require("./modules/utils");
const MESSAGES = require("./lang/en/en");

// Plain node http server (no Express) that routes the three lab endpoints
class LabServer {
    static BASE_PATH = "/COMP4537/labs/4";
    static FILE_NAME = "file.txt";
    static READ_PREFIX = "/readFile/";
    static HTML = { "Content-Type": "text/html; charset=utf-8" };
    static TEXT = { "Content-Type": "text/plain; charset=utf-8" };

    constructor(port) {
        this.port = port;
        // FILES_DIR points at a persistent volume when hosted (e.g. /data on Railway)
        this.store = new FileStore(process.env.FILES_DIR || path.join(__dirname, "files"));
        this.server = http.createServer((req, res) => this.handle(req, res));
    }

    start() {
        this.server.listen(this.port, () => {
            console.log(Utils.format(MESSAGES.LISTENING, this.port));
        });
    }

    handle(req, res) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const route = url.pathname.startsWith(LabServer.BASE_PATH)
            ? url.pathname.slice(LabServer.BASE_PATH.length).replace(/\/$/, "")
            : null;

        if (req.method !== "GET" || route === null) {
            this.send(res, 404, LabServer.TEXT, MESSAGES.ROUTE_NOT_FOUND);
        } else if (route === "/getDate") {
            this.getDate(url, res);
        } else if (route === "/writeFile") {
            this.writeFile(url, res);
        } else if (route.startsWith(LabServer.READ_PREFIX)) {
            this.readFile(decodeURIComponent(route.slice(LabServer.READ_PREFIX.length)), res);
        } else {
            this.send(res, 404, LabServer.TEXT, MESSAGES.ROUTE_NOT_FOUND);
        }
    }

    // Part B: greeting in blue, styled here on the server side
    getDate(url, res) {
        const name = url.searchParams.get("name");
        if (!name) {
            this.send(res, 400, LabServer.TEXT, MESSAGES.MISSING_NAME);
            return;
        }
        const message = Utils.escapeHtml(Utils.getDate(name));
        this.send(res, 200, LabServer.HTML, `<p style="color: blue;">${message}</p>`);
    }

    // Part C.1: append the text to file.txt, creating the file if needed
    writeFile(url, res) {
        // Read the raw value so "+" stays a plus sign (searchParams would turn it into a space)
        // and a "%" not followed by two hex digits (e.g. "100%") stays a literal percent sign
        const match = url.search.match(/[?&]text=([^&]*)/);
        const raw = match ? match[1].replace(/%(?![0-9A-Fa-f]{2})/g, "%25") : "";
        let text;
        try {
            text = decodeURIComponent(raw);
        } catch {
            // Bytes that are not valid UTF-8 (e.g. "%FF") are kept as typed
            text = raw;
        }
        if (!text) {
            this.send(res, 400, LabServer.TEXT, MESSAGES.MISSING_TEXT);
            return;
        }
        this.store.append(LabServer.FILE_NAME, text, (err) => {
            if (err) {
                this.send(res, 500, LabServer.TEXT, MESSAGES.SERVER_ERROR);
                return;
            }
            this.send(res, 200, LabServer.TEXT, Utils.format(MESSAGES.WRITE_SUCCESS, text, LabServer.FILE_NAME));
        });
    }

    // Part C.2: show the file content in the browser, 404 with the file name if missing
    readFile(fileName, res) {
        this.store.read(fileName, (err, contents) => {
            if (err && (err.code === "ENOENT" || err.code === "EISDIR")) {
                this.send(res, 404, LabServer.TEXT, Utils.format(MESSAGES.FILE_NOT_FOUND, fileName));
            } else if (err) {
                this.send(res, 500, LabServer.TEXT, MESSAGES.SERVER_ERROR);
            } else {
                this.send(res, 200, LabServer.TEXT, contents);
            }
        });
    }

    send(res, status, headers, body) {
        res.writeHead(status, headers);
        res.end(body);
    }
}

// Starter: everything else lives in classes
new LabServer(process.env.PORT || 8080).start();
