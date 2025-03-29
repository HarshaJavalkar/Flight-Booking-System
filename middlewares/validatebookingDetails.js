const validateBookingRequest = (req, res, next) => {
  const { email } = req.body.user;
  const { flightNumber, seatType, passengers } = req.body;

  if (
    !email ||
    !flightNumber ||
    !seatType ||
    !passengers ||
    passengers.length <= 0 ||
    !Array.isArray(passengers)
  ) {
    return res.status(400).json({ error: "Invalid request data" });
  }

  if (!["business", "economy"].includes(seatType)) {
    return res.status(400).json({ error: "Invalid seat type" });
  }

  if (passengers.length < 1 || passengers.length > 4) {
    return res
      .status(400)
      .json({ error: "Passengers count must be between 1 and 4" });
  }

  next();
};

module.exports = { validateBookingRequest };
