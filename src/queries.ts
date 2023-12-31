import { response } from "express";
import getMonthNameFromDate from "./utils/dateToMonth"; // get the bookingMonth from the bookingDate
require('dotenv').config();
//src\utils\dateToMonth.tsx
import { Pool } from 'pg';
import nodemailer from 'nodemailer'; // Import the nodemailer package
import { Request, Response } from 'express';


const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "tent_admin",
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

    const customerEmail = formData.email_address; // Use the email address from the form data
    const firstName = formData.first_name;
    const bookingDate = new Date(formData.booking_date).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'GMT', // Set the timezone if needed
    });

    const mailOptions = {

        from: 'adejord@gmail.com', // Replace with your email address
        to: customerEmail, // Use the customer's email address
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

    try {
        const result = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully: ', result);
    } catch (error) {
        console.error('Error sending email: ', error);
    }
};




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
        contact_number,
        email_address,
        house_number,
        street_name,
        city,
        postcode,
        booking_date,
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
            (first_name, surname, contact_number, email_address, house_number, street_name, city, postcode, booking_date, wheelchair_users, smoking, destination, lunch_arrangements, notes, terms_and_conditions, group_leader_policy, bookingMonth)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
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
            booking_date,
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
        contact_number,
        email_address,
        house_number,
        street_name,
        city,
        postcode,
        booking_date,
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
            SET first_name = $1, surname = $2, contact_number = $3, email_address = $4, house_number = $5, street_name = $6, city = $7, postcode = $8, booking_date = $9, wheelchair_users = $10, smoking = $11, destination = $12, lunch_arrangements = $13, notes = $14, terms_and_conditions = $15, group_leader_policy = $16, bookingMonth = $17
            WHERE id = $18
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
            booking_date,
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

module.exports = {
    getAllBookings,
    createBooking,
    getAllDates,
    sendEmail,
    updateBooking,
    getBookingById
}; 
