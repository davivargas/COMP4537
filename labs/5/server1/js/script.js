const API_URL = "http://localhost:3000";

class ApiClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    async insertPatients() {
        const response = await fetch(
            `${this.baseURL}/api/v1/insert`,
            {
                method: "POST"
            }
        );

        return await response.json();
    }

    async getPatients(query) {
        const encodedQuery = encodeURIComponent(query);

        const response = await fetch(
            `${this.baseURL}/api/v1/sql/${encodedQuery}`,
            {
                method: "GET"
            }
        );

        return await response.json();
    }
}

class PatientPage {
    constructor() {
        this.api = new ApiClient(API_URL);

        this.insertButton = document.getElementById("insertButton");
        this.submitButton = document.getElementById("submitButton");
        this.sqlQuery = document.getElementById("sqlQuery");
        this.response = document.getElementById("response");

        this.insertButton.addEventListener("click", () => {
            this.insertPatients();
        });

        this.submitButton.addEventListener("click", () => {
            this.submitQuery();
        });
    }

    async insertPatients() {
        this.response.textContent = USER.loading;

        try {
            const data = await this.api.insertPatients();
            this.displayResponse(data);
        } catch (error) {
            this.response.textContent = USER.error + error.message;
        }
    }

    async submitQuery() {
        const query = this.sqlQuery.value.trim();

        if (query === "") {
            this.response.textContent = USER.emptyQuery;
            return;
        }

        this.response.textContent = USER.loading;

        try {
            const data = await this.api.getPatients(query);
            this.displayResponse(data);
        } catch (error) {
            this.response.textContent = USER.error + error.message;
        }
    }

    displayResponse(data) {
        this.response.textContent = JSON.stringify(data, null, 2);
    }
}

const patientPage = new PatientPage();
