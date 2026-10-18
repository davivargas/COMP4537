const mysql = require("mysql2/promise");

const MESSAGES = {
    insertSuccess: "Patients inserted successfully."
};

class Database {
    constructor() {
        const config = {
            host: process.env.DB_HOST || "localhost",
            port: Number(process.env.DB_PORT || 3306),
            database: process.env.DB_NAME || "lab5",
            multipleStatements: false
        };

        this.writer = mysql.createPool({
            ...config,
            user: process.env.DB_WRITER_USER,
            password: process.env.DB_WRITER_PASSWORD
        });

        this.reader = mysql.createPool({
            ...config,
            user: process.env.DB_READER_USER,
            password: process.env.DB_READER_PASSWORD
        });
    }

    async createTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS patient (
                patientid INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100),
                dateOfBirth DATETIME
            ) ENGINE=InnoDB
        `;

        await this.writer.query(sql);
    }

    async insertPatients() {
        await this.createTable();

        const sql = `
            INSERT INTO patient (name, dateOfBirth)
            VALUES (?, ?), (?, ?), (?, ?), (?, ?)
        `;

        const patients = [
            "Sara Brown", "1901-01-01",
            "John Smith", "1941-01-01",
            "Jack Ma", "1961-01-30",
            "Elon Musk", "1999-01-01"
        ];

        const [result] = await this.writer.execute(sql, patients);

        return {
            message: MESSAGES.insertSuccess,
            inserted: result.affectedRows
        };
    }

    async runQuery(sql) {
        const [rows] = await this.reader.query(sql);
        return rows;
    }
}

module.exports = Database;
