const asyncHandler = require("express-async-handler");
const Flight = require("../../models/Flight");
const Booking = require("../../models/Booking");
const logger = require("../../logger/logger");

const assignTickets = (passengers, availableSeats, currentPassengersCount) => {
  let seatsInEachRow = ["A", "B", "C", "D"]; // 4 seats per row

  if (passengers.length > availableSeats) {
    return { error: "Not enough available seats" };
  }

  let row = Math.floor(currentPassengersCount / 4) + 1;
  let seatIndex = currentPassengersCount % 4;

  passengers.forEach((passenger) => {
    passenger.seatNumber = `${row}${seatsInEachRow[seatIndex++]}`;

    if (seatIndex === seatsInEachRow.length) {
      seatIndex = 0;
      row++;
    }
  });

  return passengers;
};
const bookFlight = asyncHandler(async (req, res) => {
  logger.info("Incoming booking request:", { body: req.body });

  const { seatType, passengers, flight, flightNumber } = req.body;
  const { email } = req.body.user;

  const existingBooking = Boolean(
    await Booking.findOne({ email, flightNumber })
  );
  console.log("datas", email, flightNumber);
  if (existingBooking) {
    return res
      .status(400)
      .json({ error: "You have already booked this flight." });
  }
  logger.info(
    "Processing flight booking for flight number:",
    flight.flightNumber,
    "Seat type:",
    seatType
  );

  try {
    const assignedTickets = assignTickets(
      passengers,
      flight.seats.seatMap[seatType].available,
      flight.seats.totalSeats - flight.seats.availableSeats
    );
    logger.info("Assigned tickets:", { assignedTickets });

    const newBookingRequest = new Booking({
      email,
      flightNumber: flight.flightNumber,
      passengers: assignedTickets,
    });

    await newBookingRequest.save();
    logger.info("New booking saved:", { booking: newBookingRequest });

    flight.seats.availableSeats -= passengers.length;
    flight.seats.seatMap[seatType].available -= passengers.length;
    await flight.save();
    logger.info("Updated flight seat availability:", {
      availableSeats: flight.seats.availableSeats,
      seatTypeAvailability: flight.seats.seatMap[seatType].available,
    });

    res.status(201).json({
      message: "Flight booked successfully",
      booking: newBookingRequest,
    });
    logger.info("Booking successful for flight:", flight.flightNumber);
  } catch (error) {
    logger.error("Error during flight booking:", { error: error.message });
    res.status(500).json({ message: "Booking failed", error: error.message });
  }
});

module.exports = { bookFlight };
