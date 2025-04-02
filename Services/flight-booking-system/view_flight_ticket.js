const asyncHandler = require("express-async-handler");
const Booking = require("../../models/Booking");
const logger = require("../../logger/logger");

const viewFlightTicket = asyncHandler(async (req, res) => {
  const { email } = req.body.user;
  const { bookingno } = req.headers;
  console.log(req.headers);
  if (!bookingno) {
    logger.error(`please provide the booking id for ${email}`);
    return res
      .status(404)
      .json({ error: `please provide the booking id for ${email}` });
  }
  const booking = await Booking.findOne({ email, bookingNo: bookingno });

  if (!booking) {
    logger.warn(`⚠️ No bookings found for email: ${email}`);
    return res
      .status(404)
      .json({ error: `No bookings found for the email ID ${email}` });
  }

  logger.info(`✅ Booking found for email: ${email}`);
  res.status(200).json({ ticketDetails: booking });
});

module.exports = { viewFlightTicket };
