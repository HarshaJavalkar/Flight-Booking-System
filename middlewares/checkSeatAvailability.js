const Flight = require("../models/Flight");

const checkSeatAvailability = async (req, res, next) => {
  const { flightNumber, seatType, passengers } = req.body;

  const flight = await Flight.findOne({ flightNumber });
  if (!flight) {
    return res.status(404).json({ error: "Flight not found" });
  }

  if (flight.seats.seatMap[seatType].available < passengers.length) {
    return res.status(400).json({
      error: `Only ${flight.seats.seatMap[seatType].available} seats left in ${seatType} class`,
    });
  }

  req.body.flight = flight; // Pass the flight data to the next middleware
  next();
};

module.exports = { checkSeatAvailability };
