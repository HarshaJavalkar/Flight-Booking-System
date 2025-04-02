const asyncHandler = require("express-async-handler");
const Booking = require("../../models/Booking");
const logger = require("../../logger/logger");

const viewAllPassengers = asyncHandler(async (req, res) => {
  const flightNumber = req.headers["flightnumber"];
  if (!flightNumber) {
    logger.warn(`⚠️ Please provide flight number in headers`);
    return res.status(404).json({
      error: `flight number is missing from headers, please recheck the request`,
    });
  }
  const allBookings = await Booking.find({
    flightNumber,
    status: { $ne: "cancelled" },
  });

  if (!allBookings.length) {
    return res.status(404).json({ message: "No bookings found" });
  }

  const result = allBookings.flatMap((booking) => booking.passengers);
  res.status(200).json({ flightNumber, passengersList: result });
});

module.exports = { viewAllPassengers };
