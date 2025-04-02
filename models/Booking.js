const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  bookingNo: { type: String, required: true },
  email: { type: String, required: true },
  seatType: { type: String, required: true },
  flightNumber: { type: String, required: true },
  status: { type: String, required: true },
  passengers: [
    {
      passengerNumber: { type: String, required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
      seatNumber: { type: String, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const Booking = mongoose.model("Booking", BookingSchema, "bookings");

module.exports = Booking;
