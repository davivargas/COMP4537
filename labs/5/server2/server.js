const http = require("http");
const Database = require("./js/Database.js");

const PORT = process.env.PORT || 3000;

const MESSAGES = {
    running: "Lab 5 API is running.",
    databaseError: "Database request failed.",
    invalidQuery: "Please enter a valid SQL query.",
    notFound: "Route not found."
};

class ApiServer {
    constructor(port) {
        this.port = port;
        this.database = new Database();

        this.server = http.createServer((req, res) => {
            this.handleRequest(req, res);
        });
    }

    sendResponse(res, status, data) {
        res.writeHead(status, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        });

        res.end(status === 204 ? "" : JSON.stringify(data));
    }

    removeSurroundingQuotes(query) {
        if (query.length >= 2 && query.startsWith('"') && query.endsWith('"')) {
            return query.slice(1, -1).trim();
        }
        
        return query;
    }

    async handleRequest(req, res) {
        if (req.method === "OPTIONS") {
            this.sendResponse(res, 204, {});
            return;
        }

        try {
            if (req.method === "GET" && req.url === "/") {
                this.sendResponse(res, 200, {
                    message: MESSAGES.running
                });

            } else if (req.method === "POST" && req.url === "/api/v1/insert") {

                const result = await this.database.insertPatients();
                this.sendResponse(res, 200, result);

            } else if (req.method === "GET" && req.url.startsWith("/api/v1/sql/")) {

                const encodedQuery = req.url.substring(
                    "/api/v1/sql/".length
                ).split("?")[0];

                let query;

                try {
                    query = decodeURIComponent(encodedQuery).trim();
                    query = this.removeSurroundingQuotes(query);
                } catch (error) {
                    this.sendResponse(res, 400, {
                        message: MESSAGES.invalidQuery
                    });
                    return;
                }

                if (query === "") {
                    this.sendResponse(res, 400, {
                        message: MESSAGES.invalidQuery
                    });
                    return;
                }

                const result = await this.database.runQuery(query);
                this.sendResponse(res, 200, result);

            } else {
                this.sendResponse(res, 404, {
                    message: MESSAGES.notFound
                });
            }
        } catch (error) {
            console.error("Database error:", error.message);

            this.sendResponse(res, 500, {
                message: MESSAGES.databaseError
            });
        }
    }

    start() {
        this.server.listen(this.port, () => {
            console.log(`Server running on port ${this.port}`);
        });
    }
}

const apiServer = new ApiServer(PORT);
apiServer.start();
