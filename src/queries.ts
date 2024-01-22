require('dotenv').config();
import getMonthNameFromDate from "./utils/dateToMonth"; // get the bookingMonth from the bookingDate
//src\utils\dateToMonth.tsx
import { Pool } from 'pg';
import nodemailer from 'nodemailer'; // Import the nodemailer package


const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "postgres",
    password: process.env.REACT_APP_DB_PASSWORD,
    port: 5432,
});

//Send email to customer
const sendEmail = async (req, res) => {
    const formData = req.body;

    // Create a transporter object
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.REACT_APP_GOOGLE_EMAIL,
            pass: process.env.REACT_APP_GOOGLE_PASSWORD
        }
    });

    const customerEmail = formData.email_address;
    const firstName = formData.first_name;
    const surname = formData.surname;
    const bookingDate = new Date(formData.booking_date).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'GMT',
    });
    console.log(formData);


//need to make another site like this to upload without disruption

    

    const mailOptionsToCustomer = {
        from: 'adejord@gmail.com',
        to: customerEmail,
        subject: 'Booking Confirmation',
        html: `<p>Hi ${firstName},</p>
        <p>Thank you for booking with us. Your booking is confirmed for ${bookingDate}.</p>
        <p>We usually leave the marina at 10:30am and return at 15:30pm.</p>
        <p>Please arrive at least 15 minutes before departure time.</p>
        <p>If you have any questions, please call us on 07512 896 176.</p>
        <p>See you soon!</p>
        <p> This is an automated email, please do not reply.</p>
        `
    };

    const mailOptionsToAdejord = {
        from: 'adejord@gmail.com',
        to: 'adejord@gmail.com',
        subject: 'New Booking',
        text: `${firstName} ${surname} has booked a trip on ${bookingDate} to ${formData.destination}.`
    };

    try {
        const resultToCustomer = await transporter.sendMail(mailOptionsToCustomer);
        console.log('Email to customer sent successfully: ', resultToCustomer);

        const resultToAdejord = await transporter.sendMail(mailOptionsToAdejord);
        console.log('Email to adejord@gmail.com sent successfully: ', resultToAdejord);
    } catch (error) {
        console.error('Error sending email: ', error);
    }
}


// Get all bookings (For Mariel/Admin to view all bookings)
const getAllBookings = (request, response) => {
    pool.query('SELECT * FROM bookings ORDER BY id ASC', (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
}

// Get all dates (for checking if a date is available)
const getAllDates = (request, response) => {
    pool.query('SELECT TO_CHAR(booking_date, \'YYYY-MM-DD\') AS formatted_date FROM bookings ORDER BY id ASC', (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows.map(row => row.formatted_date));
    });
}


//Create A Booking (For the customer to create a booking)
const createBooking = async (request, response) => {
    const {
        first_name,
        surname,
        group_name,
        contact_number,
        email_address,
        house_number,
        street_name,
        city,
        postcode,
        booking_date,
        total_passengers,
        wheelchair_users,
        smoking,
        destination,
        lunch_arrangements,
        notes,
        terms_and_conditions,
        group_leader_policy,

    } = request.body;

    try {
        const myDate = new Date(booking_date);
        const bookingMonth = getMonthNameFromDate(myDate);

        const query = `
            INSERT INTO bookings
            (first_name, surname, group_name, contact_number, email_address, house_number, street_name, city, postcode, booking_date, total_passengers, wheelchair_users, smoking, destination, lunch_arrangements, notes, terms_and_conditions, group_leader_policy, bookingMonth)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
            RETURNING *`;

        const values = [
            first_name,
            surname,
            group_name,
            contact_number,
            email_address,
            house_number,
            street_name,
            city,
            postcode,
            booking_date,
            total_passengers,
            wheelchair_users,
            smoking,
            destination,
            lunch_arrangements,
            notes,
            terms_and_conditions,
            group_leader_policy,
            bookingMonth,
        ];

        const result = await pool.query(query, values);

        console.log(`Booking added with ID: ${result.rows[0].id} in ${bookingMonth}`);
        response.status(201).json({ message: `Booking added with ID: ${result.rows[0].id}` });
    } catch (error) {
        console.error("Error creating booking:", error);
        response.status(500).json({ error: "Internal Server Error try again and call Ade if not working" });
    }

};

const updateBooking = async (request, response) => {
    const {
        first_name,
        surname,
        group_name,
        contact_number,
        email_address,
        house_number,
        street_name,
        city,
        postcode,
        booking_date,
        total_passengers,
        wheelchair_users,
        smoking,
        destination,
        lunch_arrangements,
        notes,
        terms_and_conditions,
        group_leader_policy,
    } = request.body;

    try {
        const myDate = new Date(booking_date);
        const bookingMonth = getMonthNameFromDate(myDate);
        
        const query = `
            UPDATE bookings
            SET first_name = $1, surname = $2, group_name = $3, contact_number = $4, email_address = $5, house_number = $6, street_name = $7, city = $8, postcode = $9, booking_date = $10, total_passengers = $11, wheelchair_users = $12, smoking = $13, destination = $14, lunch_arrangements = $15, notes = $16, terms_and_conditions = $17, group_leader_policy = $18, bookingMonth = $19
            WHERE id = $20
            RETURNING *`;

        const values = [
            first_name,
            surname,
            group_name,
            contact_number,
            email_address,
            house_number,
            street_name,
            city,
            postcode,
            booking_date,
            total_passengers,
            wheelchair_users,
            smoking,
            destination,
            lunch_arrangements,
            notes,
            terms_and_conditions,
            group_leader_policy,
            bookingMonth,
            request.params.id,
        ];

        const result = await pool.query(query, values);

        console.log(`Booking updated with ID: ${result.rows[0].id} in ${bookingMonth}`);
        response.status(201).json({ message: `Booking updated with ID: ${result.rows[0].id}` });
    } catch (error) {
        console.error("Error updating booking:", error);
        response.status(500).json({ error: "Internal Server Error try again and call Ade if not working" });
    }
};

interface RouteParams {
    id: any;
}

const getBookingById = async (request, response) => {
    const { bookingId } = request.params;
    console.log("id", bookingId);
    try {
        const result = await pool.query('SELECT * FROM bookings WHERE id = $1', [bookingId]); // Use 'await' to wait for the query result

        if (result.rows.length === 0) {
            response.status(404).json({ message: "No booking found with the given ID" });
            return;
        }

        console.log("result", result.rows[0]);
        response.status(200).json(result.rows[0]); // Send only this response when a booking is found


    } catch (error) {
        console.error("Error finding booking:", error);
        response.status(500).json({ error: "Internal Server Error try again and call Ade if not working" });
    }
}

const deleteBooking = async (request, response) => {
    const { bookingId } = request.params;

    
    
    try {
        const result = await pool.query('DELETE FROM bookings WHERE id = $1', [bookingId]); // Use 'await' to wait for the query result
        console.log("Deleted id", bookingId);

        if (result.rowCount === 0) {
            // No rows were affected, which means the booking was not found.
            response.status(404).json({ message: "No booking found with the given ID" });
            return;
        }

        console.log("result", result.rows[0]);
        response.status(200).json({ message: "Booking deleted successfully" });
        } catch (error) {
        console.error("Error finding booking:", error);
        response.status(500).json({ error: "Internal Server Error try again and call Ade if not working" });
    }
}

const getAllVolunteers = (request, response) => {
    pool.query('SELECT * FROM volunteers ORDER BY id ASC', (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
}

const addVolunteer = async (request, response) => {
    const {
        first_name,
        surname,
        contact_number,
        email_address,
        house_number,
        street_name,
        city,
        postcode,
        role,
        notes,
    } = request.body;

    try {
        const query = `
            INSERT INTO volunteers
            (first_name, surname, contact_number, email_address, house_number, street_name, city, postcode, role, notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *`;

        const values = [
            first_name,
            surname,
            contact_number,
            email_address,
            house_number,
            street_name,
            city,
            postcode,
            role,
            notes,
        ];

        const result = await pool.query(query, values);

        console.log(`Volunteer added with ID: ${result.rows[0].id}`);
        response.status(201).json({ message: `Volunteer added with ID: ${result.rows[0].id}` });
    } catch (error) {
        console.error("Error creating volunteer:", error);
        response.status(500).json({ error: "Internal Server Error try again and call Ade if not working" });
    }

}


module.exports = {
    getAllBookings,
    createBooking,
    getAllDates,
    sendEmail,
    updateBooking,
    getBookingById,
    deleteBooking,
    getAllVolunteers,
    addVolunteer
}; 
