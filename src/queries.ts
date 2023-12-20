import { response } from "express";
import getMonthNameFromDate from "./utils/dateToMonth"; // get the bookingMonth from the bookingDate

//src\utils\dateToMonth.tsx
import { Pool } from 'pg';

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "tent_admin",
    password: "12477560",
    port: 5432,
});

//Get all bookings (For Mariel to see all bookings)
const getAllBookings = (request, response) => {
    pool.query('SELECT * FROM bookings ORDER BY id ASC', (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
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
            RETURNING *;`;

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

        console.log("Booking added with ID:", result.rows[0].id + " in " + bookingMonth);

        response.status(201).send(`Booking added with ID: ${result.rows[0].id}`);
    } catch (error) {
        console.error("Error creating booking:", error);
        response.status(500).send("Internal Server Error");
    }
};





module.exports = {
    getAllBookings,
    createBooking
}
