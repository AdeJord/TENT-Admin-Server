const https = require('https');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Create an instance of express app
const app = express();
// Define the port number as per your setup
const port = 443; // This should be the port your app runs on internally for HTTPS
// Define your allowed origins for CORS
var allowedOrigins = [
  '*', // Allow from anywhere for now
  'http://localhost:3000',
  'https://tent-admin.netlify.app',
];

// Set up CORS middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl requests)
      if (!origin) return callback(null, true);

      // Only allow origins from the allowedOrigins list
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        var msg = 'The CORS policy for this site does not ' +
                  'allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
    },
    credentials: true,
  })
);

// Set up body-parser middleware to handle JSON and URL-encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Import your database queries or route handlers
const db = require("./queries");

app.get('/', (req, res) => {
  res.send('Application works!');
});
app.get('/bookings', db.getAllBookings);
app.post('/createBooking', db.createBooking);
app.get('/dates', db.getAllDates);
app.post('/sendEmail', db.sendEmail);
app.patch('/updateBooking/:id', db.updateBooking);
app.get('/bookings/:bookingId', db.getBookingById);
app.delete('/deleteBooking/:bookingId', db.deleteBooking);
app.get('*', (req, res) => {
  res.status(404).send('404 Not Found. Something is wrong.');
});

// Load SSL/TLS certificate and private key
const privateKey = fs.readFileSync('src/privkey.pem', 'utf8');

const certificate = fs.readFileSync('src/fullchain.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Create HTTPS server
const httpsServer = https.createServer(credentials, app);

httpsServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
