CREATE DATABASE IF NOT EXISTS lab5;

-- User for creating the table and inserting patients
CREATE USER IF NOT EXISTS 'lab5_writer'@'%'
IDENTIFIED BY 'REPLACE_WITH_WRITER_PASSWORD';

GRANT CREATE, INSERT
ON lab5.*
TO 'lab5_writer'@'%';

-- User for reading patient records
CREATE USER IF NOT EXISTS 'lab5_reader'@'%'
IDENTIFIED BY 'REPLACE_WITH_READER_PASSWORD';

GRANT SELECT
ON lab5.*
TO 'lab5_reader'@'%';
