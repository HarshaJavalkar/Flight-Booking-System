const asyncHandler = require("express-async-handler");
const Booking = require("../../models/Booking");
const logger = require("../../logger/logger");

const viewFlightTicket = asyncHandler(async (req, res) => {
  const { email } = req.body.user;

  try {
    const booking = await Booking.findOne({ email });

    if (!booking) {
      logger.warn(`⚠️ No bookings found for email: ${email}`);
      return res
        .status(404)
        .json({ error: `No bookings found for the email ID ${email}` });
    }

    logger.success(`✅ Booking found for email: ${email}`);
    res.status(200).json({ ticketDetails: booking });
  } catch (error) {
    logger.error(`❌ Error fetching booking for ${email}: ${error.message}`, {
      stack: error.stack,
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = { viewFlightTicket };
