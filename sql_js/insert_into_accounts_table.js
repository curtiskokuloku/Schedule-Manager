/**
 * TODO: Read comments carefully and replace necessary code marked with "X...X"
 */

const mysql = require("mysql");
const bcrypt = require('bcrypt');

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

    const saltRounds = 10;
    const myPlaintextPassword = 'XXXXXXXX'; // TODO: FIXME
    const passwordHash = bcrypt.hashSync(myPlaintextPassword, saltRounds);

    const rowToBeInserted = {
        acc_name: 'XXXXXXXX',   //! acc_name and acc_login are the same
        acc_login: 'XXXXXXXX',
        acc_password: passwordHash
    };

    console.log("Attempting to insert record into tbl_accounts");
    dbCon.query('INSERT tbl_accounts SET ?', rowToBeInserted, function (err, result) {
        if (err) {
            throw err;
        }
        console.log("Table record inserted!");
    });

    dbCon.end();
});
