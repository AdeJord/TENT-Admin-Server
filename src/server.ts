import express from 'express';
import { Request, Response } from 'express';
const db = require("./queries");
const bodyParser = require("body-parser");
const cors = require("cors");


const app = express();
const port = 8000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get('/', (req: Request, res: Response) => {
  res.send('Application works!');
});

app.get('/bookings', db.getAllBookings);
app.post('/createBooking', db.createBooking);

app.listen(port, () => {
  console.log(`Server is live on port ${port}`);
});