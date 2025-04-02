const Flight = require("../../models/Flight");
const Booking = require("../../models/Booking");
isSeatAvailable = (seat1, seat2) => {
  const extractParts = (seat) => {
    const num = parseInt(seat.match(/\d+/)[0], 10); // Extract number
    const letter = seat.match(/[A-Z]/i)[0]; // Extract letter
    return { num, letter };
  };

  const s1 = extractParts(seat1);
  const s2 = extractParts(seat2);

  if (s1.num !== s2.num) {
    return s1.num < s2.num;
  }

  return s1.letter < s2.letter; // Compare letters alphabetically
};
const modifySeatAssignment = async (req, res) => {
  const { email, flightNumber, newSeat } = req.body;
  const booking = await Booking.findOne({ email, flightNumber });
  if (!booking) {
    return { success: false, message: "Passenger not found." };
  }

  // Check if the new seat is available
  const flight = await Flight.findOne({ flightNumber });
  if (!flight) {
    return { success: false, message: "Flight not found." };
  }

  const totalSeats = flight.seats.seatMap[seatType].total;
  const availableSeats = flight.seats.seatMap[seatType].available;
  const filledUptoCount = totalSeats - availableSeats;
  const seatsInEachRow = ["A", "B", "C", "D"];
  const lastFilledSeatInRow = filledUptoCount % 4;
  const isSeatAvailable = isSeatAvailable(
    filledUptoCount + lastFilledSeatInRow,
    newSeat
  );
  const isInCancelledSeats =
    flight.seats.seatMap[seatType].cancelledSeats.filter(
      (seat) => seat == newSeat
    ).length > 0;
  if (!isSeatAvailable && !isInCancelledSeats) {
    return res
      .status(400)
      .json({ message: "Seat is already filled by another passenger" });
  }

  // Update the passenger's seat
  passenger.seat = newSeat;
  await passenger.save();

  // Update flight seat records
  flight.bookedSeats = flight.bookedSeats.filter(
    (seat) => seat !== passenger.seat
  );
  flight.bookedSeats.push(newSeat);
  await flight.save();

  return { success: true, message: "Seat updated successfully." };
};

module.exports = { modifySeatAssignment };
