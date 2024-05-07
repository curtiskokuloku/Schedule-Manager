/**
 * TODO: Read comments carefully and replace necessary code marked with "X...X"
 */

// Include necessary modules
const express = require("express");         // For creating web server
const bodyParser = require('body-parser');  // For parsing request bodies
const session = require('express-session'); // For session management
const bcrypt = require('bcrypt');           // For password hashing
const mysql = require("mysql");             // For interacting with MySQL database

// Create an express application
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Configure the session middleware
app.use(session({
  secret: "XXXXXXXX",                       // TODO: FIXME. Secret key for session.
  saveUninitialized: true,                  // Save uninitialized session
  resave: false                             // Do not resave unchanged session
}));


// Create and establish a MySQL connection
const dbCon = mysql.createConnection({
  host: "XXXXXXXXXXXXXXXXXXXX",   // TODO: FIXME
  user: "XXXXXXXXXXXX",           // ...
  password: "XXXX",               // ...
  database: "XXXXXXXXXXXX",       // ...
  port: 8000  // Change the port if you'd like to use a port of your choice.
});

dbCon.connect(function (err) {
  if (err) {
    throw err;                              // Throw error if connection fails
  }
  console.log("Connected to database!");
});

// Start the server
const port = 9003;                          // Server port
const server = app.listen(port, () => console.log('Server listening on port ' + port + '...\n(Enter \'q\' to quit)'));

// Middleware to serve static files
app.use('/static', express.static(__dirname + '/static'));

//Load view engine
app.set('views', './client/views');         // Set views director
app.set('view engine', 'pug');              // Set view engine to Pug

// Route to return the welcome page
app.get('/', function (req, res) {
  // res.sendFile(__dirname + '/static/html/welcome.html');
  console.log('Home page!');
  res.render('welcome');                    // Render welcome page using Pug
});

// Route to serve the login page
app.get('/login', (req, res) => {
  if (req.session.userId) {
    console.log('User ' + req.session.userId + ' is already logged in!');
    res.redirect('/schedule');              // Redirect logged-in users to schedule page
    return;
  }
  // res.sendFile(__dirname + '/static/html/login.html');
  console.log('Login page!');
  res.render('login');                      // Render login page using Pug
});

// Route to serve the schedule page
app.get('/schedule', (req, res) => {
  if (!req.session.userId) {
    res.redirect('/login');                 // Redirect non-logged-in users to login page
    return;
  }
  // res.sendFile(__dirname + '/static/html/schedule.html');
  res.render('schedule');                   // Render schedule page using Pug
});

// Route to serve the addEvent page
app.get('/addEvent', (req, res) => {
  if (!req.session.userId) {
    res.redirect('/login');                 // Redirect non-logged-in users to login page
    return;
  }
  // res.sendFile(__dirname + '/static/html/addEvent.html');
  res.render('addEvent');                   // Render addEvent page using Pug
});

// Route to handle login requests
app.post('/login', (req, res) => {
  console.log('Logging in...');
  const { username, password } = req.body;

  dbCon.query('SELECT * FROM tbl_accounts WHERE acc_login = ?', [username], (err, results) => {
    if (err || results.length === 0) {
      console.log('Invalid username or password. Try again!');
      res.render('invalidLogin');           // Render the invalidLogin view if username not found
      return;
    }

    const user = results[0];
    bcrypt.compare(password, user.acc_password, (err, result) => {
      if (err || !result) {
        console.log('Invalid password or password. Try again!');
        res.render('invalidLogin');         // Render the invalidLogin view if password is incorrect
        return;
      }

      console.log('Logged in successfully!');
      req.session.userId = user.acc_id;     // Set session userId
      res.redirect('/schedule');            // Redirect to schedule page after successful login
    });
  });
});

// Route to get schedule data
app.get('/getSchedule', (req, res) => {
  const { day } = req.query;

  console.log('Getting event data for ' + day + '...');
  dbCon.query('SELECT * FROM tbl_events WHERE event_day = ? ORDER BY event_start ASC', [day], (err, results) => {
    if (err) {
      res.status(500).send('Error retrieving schedule data'); // Send error if query fails
      return;
    }
    if (results.length === 0) {
      console.log('No events yet for ' + day + '!');
    } else {
      console.log("Events loaded!")
    }
    res.json(results);                      // Send JSON response with schedule data
  });
});

// Route to handle adding an event
app.post('/postEventEntry', (req, res) => {
  if (!req.session.userId) {
    res.status(401).send('Unauthorized');   // Send error if user is not logged in
    return;
  }

  // Get schedule data from the response
  console.log('Adding event...');
  const rowToBeInserted = {
    event_day: req.body.day,
    event_event: req.body.event,
    event_start: req.body.start,
    event_end: req.body.end,
    event_location: req.body.location,
    event_phone: req.body.phone,
    event_info: req.body.info,
    event_url: req.body.url
  };

  dbCon.query('INSERT INTO tbl_events SET ?', rowToBeInserted, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error adding event'); // Send error if insertion fails
      return;
    }

    console.log('Event added successfully!');
    res.redirect('/schedule');                    // Redirect to schedule page after adding event
  });
});

// Route to handle deleting an event
app.delete('/deleteEvent/:id', (req, res) => {
  const eventId = req.params.id;

  dbCon.query('DELETE FROM tbl_events WHERE event_id = ?', eventId, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error deleting event');
      return;
    }

    console.log('Event deleted successfully!');
    res.sendStatus(200); // Send success response
  });
});

// Route to serve the editEvent page
app.get('/schedule/edit/:id', (req, res) => {
  if (!req.session.userId) {
    res.redirect('/login');                 // Redirect non-logged-in users to login page
    return;
  }

  const eventId = req.params.id;

  console.log('Getting event data for editing...');
  dbCon.query('SELECT * FROM tbl_events WHERE event_id = ?', [eventId], (err, results) => {
    if (err || results.length === 0) {
      res.status(404).send('Event not found'); // Send 404 response if event not found
      return;
    }

    console.log('Event loaded for editing!');
    res.render('editEvent', { event: results[0] }); // Render editEvent page with event data
  });
});

// Route to handle editing an event
app.post('/schedule/edit/:id', (req, res) => {
  if (!req.session.userId) {
    res.status(401).send('Unauthorized');   // Send error if user is not logged in
    return;
  }

  const eventId = req.params.id;

  console.log('Updating event...');
  const updatedEvent = {
    event_day: req.body.day,
    event_event: req.body.event,
    event_start: req.body.start,
    event_end: req.body.end,
    event_location: req.body.location,
    event_phone: req.body.phone,
    event_info: req.body.info,
    event_url: req.body.url
  };

  confirm.query("Update tb_todo Set due_date = '5/8' Where id = (Select * from tbl_todo where )")

  dbCon.query('UPDATE tbl_events SET ? WHERE event_id = ?', [updatedEvent, eventId], (err, result) => {
    if (err || result.affectedRows === 0) {
      console.error(err);
      res.status(422).send('Failed to update event'); // Send 422 response if update fails
      return;
    }

    console.log('Event updated successfully!');
    res.redirect('/schedule');                    // Redirect to schedule page after updating event
  });
});

// Route to handle logout requests
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error logging out');  // Send error if logout fails
      return;
    }
    console.log('Logged out successfully!');
    res.redirect('/login');                       // Redirect to login page after successful logout
  });
});

// Route to handle 404 errors
app.get('*', function (req, res) {
  res.render('404');                              // Render 404 page using Pug for all other routes
});

// Listen for user input to quit server
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  if (chunk.trim().toLowerCase() === 'q') {
    console.log('Exiting server gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  }
});