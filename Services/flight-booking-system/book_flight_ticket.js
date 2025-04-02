const asyncHandler = require("express-async-handler");
const Flight = require("../../models/Flight");
const Booking = require("../../models/Booking");
const logger = require("../../logger/logger");

const assignTickets = (
  passengers,
  availableSeats,
  currentPassengersCount,
  cancelledSeats
) => {
  let seatsInEachRow = ["A", "B", "C", "D"]; // 4 seats per row

  if (passengers.length > availableSeats) {
    return { error: "Not enough available seats" };
  }

  let row = Math.floor(currentPassengersCount / 4) + 1;
  let seatIndex = currentPassengersCount % 4;
  let assignedSeats = new Set(); // Track assigned seats

  // Assign normal sequential seats first
  let regularPassengers = passengers.slice(
    0,
    passengers.length - cancelledSeats.length
  );
  let cancelledPassengers = passengers.slice(
    passengers.length - cancelledSeats.length
  );

  regularPassengers.forEach((passenger) => {
    while (assignedSeats.has(`${row}${seatsInEachRow[seatIndex]}`)) {
      seatIndex++;
      if (seatIndex === seatsInEachRow.length) {
        seatIndex = 0;
        row++;
      }
    }

    passenger.seatNumber = `${row}${seatsInEachRow[seatIndex++]}`;
    assignedSeats.add(passenger.seatNumber);

    if (seatIndex === seatsInEachRow.length) {
      seatIndex = 0;
      row++;
    }
  });

  // Assign cancelled seats last
  cancelledPassengers.forEach((passenger, index) => {
    passenger.passengerNumber = generatebookingNo();
    passenger.seatNumber = cancelledSeats[index];
  });

  return [...regularPassengers, ...cancelledPassengers];
};

const generateBookingNo = (kind = "passenger") => {
  return (
    (kind === "booking" ? "BK" : "PN") +
    Math.random().toString(36).substr(2, 8).toUpperCase()
  );
};

const bookFlight = asyncHandler(async (req, res) => {
  logger.info("Incoming booking request:", { body: req.body });

  const { seatType, passengers, flight, flightNumber } = req.body;
  const { email } = req.body.user;

  logger.info(
    "Processing flight booking for flight number:",
    flight.flightNumber,
    "Seat type:",
    seatType
  );

  const assignedTickets = assignTickets(
    passengers,
    flight.seats.seatMap[seatType].available,
    flight.seats.seatMap[seatType].total -
      flight.seats.seatMap[seatType].available,
    flight.seats.seatMap[seatType].cancelledSeats
  );
  logger.info("Assigned tickets:", { assignedTickets });

  const newBookingRequest = new Booking({
    email,
    seatType,
    flightNumber: flight.flightNumber,
    passengers: assignedTickets,
    status: "confirmed",
    bookingNo: generatebookingNo("booking"),
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
});

module.exports = { bookFlight };
