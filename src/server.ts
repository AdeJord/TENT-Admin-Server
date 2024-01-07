require('dotenv').config();
import express from 'express';
import { Request, Response } from 'express';



const db = require("./queries");
const bodyParser = require("body-parser");
const cors = require("cors");


const app = express();
const port = 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get('/', (req: Request, res: Response) => {
  res.send('Application works!', );
});

app.get('/bookings', db.getAllBookings);
app.post('/createBooking', db.createBooking);
app.get('/dates', db.getAllDates);
app.post('/sendEmail', db.sendEmail);
app.patch('/updateBooking/:id', db.updateBooking);
app.get('/bookings/:bookingId', db.getBookingById);
app.delete('/deleteBooking/:bookingId', db.deleteBooking);

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is live on port ${port}`);
});

app.get('*', function(req, res) {
  res.status(404).send('404 Not Found. Suminks Up!');
});