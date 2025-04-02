const mongoose = require("mongoose");

const FlightSchema = new mongoose.Schema({
  flightNumber: { type: String, required: true, unique: true },
  airline: { type: String, required: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  departureTime: { type: Date, required: true },
  arrivalTime: { type: Date, required: true },
  duration: { type: Number, required: true },
  status: {
    type: String,
    enum: ["Scheduled", "Delayed", "Departed", "Landed", "Cancelled"],
    default: "Scheduled",
  },
  aircraft: { type: String, required: true },
  gate: { type: String },
  terminal: { type: String },
  price: { type: Number, required: true },
  seats: {
    totalSeats: { type: Number, required: true },
    availableSeats: { type: Number, required: true },
    seatMap: {
      business: {
        total: { type: Number, default: 0 },
        available: { type: Number, default: 0 },
        cancelledSeats: {
          type: [String],
          required: true,
          default: [],
        },
      },
      economy: {
        total: { type: Number, default: 0 },
        available: { type: Number, default: 0 },
        cancelledSeats: {
          type: [String],
          required: true,
          default: [],
        },
      },
    },
  },
  createdAt: { type: Date, default: Date.now },
});

const Flight = mongoose.model("Flight", FlightSchema, "flights");

module.exports = Flight;
