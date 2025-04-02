const asyncHandler = require("express-async-handler");
const Booking = require("../../models/Booking");
const logger = require("../../logger/logger");

const client = require("../../redisClient"); // Import Redis client

const viewAllPassengers = asyncHandler(async (req, res) => {
  const flightNumber = req.headers["flightnumber"];

  if (!flightNumber) {
    logger.warn(`⚠️ Please provide flight number in headers`);
    return res.status(400).json({
      error: `Flight number is missing from headers, please recheck the request`,
    });
  }

  const cacheKey = `passengers:${flightNumber}`;

  // Check Redis Cache
  const cachedData = await client.get(cacheKey);
  if (cachedData) {
    logger.info(`✅ Returning cached data for flight ${flightNumber}`);
    return res.status(200).json({
      flightNumber,
      passengersList: JSON.parse(cachedData),
      source: "cache",
    });
  }

  // Fetch from MongoDB if not in cache
  const allBookings = await Booking.find({
    flightNumber,
    status: { $ne: "cancelled" },
  });

  if (!allBookings.length) {
    return res.status(404).json({ message: "No bookings found" });
  }

  const result = allBookings.flatMap((booking) => booking.passengers);

  // Store in Redis with 1-hour expiry
  await client.setEx(cacheKey,  86400, JSON.stringify(result));

  logger.info(`🆕 Cached passenger list for flight ${flightNumber}`);

  res.status(200).json({ flightNumber, passengersList: result, source: "database" });
});

module.exports = { viewAllPassengers };
