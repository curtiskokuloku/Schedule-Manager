/**
 * TODO: Read comments carefully and replace necessary code marked with "X...X"
 */

var mysql = require("mysql");

var con = mysql.createConnection({
  host: "XXXXXXXXXXXXXXXXXXXX",   // TODO: FIXME
  user: "XXXXXXXXXXXX",           // ...
  password: "XXXX",               // ...
  database: "XXXXXXXXXXXX",       // ...
  port: 8000  // Change the port if you'd like to use a port of your choice.
});

con.connect(function (err) {
  if (err) {
    throw err;
  };
  console.log("Connected!");
  var sql = `CREATE TABLE tbl_events(event_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                                         event_day VARCHAR(30),
                                         event_event VARCHAR(300),
                                         event_start VARCHAR(64),
                                         event_end VARCHAR(64),
                                         event_location VARCHAR(1024),
                                         event_phone VARCHAR(128),
                                         event_info VARCHAR(1024),
                                         event_url VARCHAR(1024))`;
  con.query(sql, function (err, result) {
    if (err) {
      throw err;
    }
    console.log("Table created");
    con.end();

  });
});
