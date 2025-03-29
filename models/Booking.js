const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  flightNumber: { type: String, required: true },
  passengers: [
    {
      name: { type: String, required: true },
      email: { type: String, required: true },
      seatNumber: { type: String, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const Booking = mongoose.model("Booking", BookingSchema, "bookings");

module.exports = Booking;
