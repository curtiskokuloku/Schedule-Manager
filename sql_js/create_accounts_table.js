/**
 * TODO: Read comments carefully and replace necessary code marked with "X...X"
 */

const mysql = require("mysql");

const dbCon = mysql.createConnection({
    host: "XXXXXXXXXXXXXXXXXXXX",   // TODO: FIXME
    user: "XXXXXXXXXXXX",           // ...
    password: "XXXX",               // ...
    database: "XXXXXXXXXXXX",       // ...
    port: 8000  // Change the port if you'd like to use a port of your choice.
});

console.log("Attempting database connection");
dbCon.connect(function (err) {
    if (err) {
        throw err;
    }
    console.log("Connected to database!");

    const sql = `CREATE TABLE tbl_accounts (
        acc_id       INT NOT NULL AUTO_INCREMENT,
        acc_name     VARCHAR(20),
        acc_login    VARCHAR(20),
        acc_password VARCHAR(200),
        PRIMARY KEY (acc_id)
    )`;

    console.log("Attempting to create table: tbl_accounts");
    dbCon.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        console.log("Table tbl_accounts created");
    });

    dbCon.end();
});
