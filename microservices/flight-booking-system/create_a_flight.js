const asyncHandler = require("express-async-handler");
const Flight = require("../../models/Flight");

const createFlight = asyncHandler(async (req, res) => {
  try {
    const flight = new Flight(req.body);
    await flight.save();
    res.status(201).json({ message: "Flight schedule created", flight });
  } catch (error) {
    console.log("java" + error.code);
    res.status(400).json({ error: error.message });
  }
});

module.exports = { createFlight };
