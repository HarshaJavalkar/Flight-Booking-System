const asyncHandler = require("express-async-handler");
const Booking = require("../../models/Booking");
const Flight = require("../../models/Flight");
const cancelFlightTicket = asyncHandler(async (req, res) => {
  const { flightNumber, email, bookingNo } = req.body;

  const booking = await Booking.findOne({ email, flightNumber, bookingNo });

  if (!booking) {
    return res.status(404).json({ message: "Booking not found." });
  }

  if(booking.status==='cancelled'){
    return res.status(400).json({ message: "already cancelled" });
  }
  
  booking.status = "cancelled";
  await booking.save();

  // Step 3: Update Flight Data
  const flight = await Flight.findOne({ flightNumber });

  if (!flight) {
    return res.status(404).json({ message: "Flight not found." });
  }

  // Step 4: Get the passengers & seat type
  const { passengers } = booking;
  const seatType = booking.seatType; 
  // Step 5: Increase available seats
  flight.seats.availableSeats += passengers.length;
  flight.seats.seatMap[seatType].available += passengers.length;

  // Step 6: Free up seats in seatMap
  passengers.forEach((passenger) => {
    const seatNumber = passenger.seatNumber;

    if (!flight.seats.seatMap[seatType].cancelledSeats) {
      flight.seats.seatMap[seatType].cancelledSeats = [];
    }
    flight.seats.seatMap[seatType].cancelledSeats.push(seatNumber);
  });

  await flight.save();

  return res.status(200).json({
    message: "Flight ticket cancelled successfully.",
    availableSeats: flight.seats.availableSeats,
  });
});

module.exports = { cancelFlightTicket };
