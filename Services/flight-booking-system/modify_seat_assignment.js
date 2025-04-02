const Flight = require("../../models/Flight");
const Booking = require("../../models/Booking");
const logger = require("../../logger/logger")
checkSeatIfAvailable = (oldSeat, newSeat) => {

  if (oldSeat == newSeat) {
    return false;
  }

  const extractParts = (seat) => {
    const num = parseInt(seat.match(/\d+/)[0], 10); // Extract number
    const letter = seat.match(/[A-Z]/i)[0]; // Extract letter
    return { num, letter };
  };

  const s1 = extractParts(oldSeat);
  const s2 = extractParts(newSeat);

  if (s1.num !== s2.num) {
    return s1.num < s2.num;
  }
  return s1.letter < s2.letter; 
};
const modifySeatAssignment = async (req, res) => {
    const { email, flightNumber, newSeat, passengerNumber, newSeatType, bookingNo } = req.body;
    
    console.log(email, flightNumber)
    if (!email || !flightNumber || !newSeat || !passengerNumber || !newSeatType) {
      logger.warn("Missing required fields "+JSON.stringify(req.body));
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    const booking = await Booking.findOne({ email, flightNumber, bookingNo });
    if (!booking) {
      logger.warn("Booking not found", { email, flightNumber });
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    const flight = await Flight.findOne({ flightNumber });
    if (!flight) {
      logger.warn("Flight not found", { flightNumber });
      return res.status(404).json({ success: false, message: "Flight not found." });
    }

    const seatType = booking.seatType;
    const totalSeats = flight.seats.seatMap[newSeatType]?.total;
    const availableSeats = flight.seats.seatMap[newSeatType]?.available;
    if (totalSeats === undefined || availableSeats === undefined) {
      logger.warn("Invalid seat type", { newSeatType });
      return res.status(400).json({ success: false, message: "Invalid seat type." });
    }

    const filledUptoCount = totalSeats - availableSeats;
    const seatsInEachRow = ["A", "B", "C", "D"];
    const lastFilledSeat = filledUptoCount + seatsInEachRow[filledUptoCount % seatsInEachRow.length];

    const isSeatAvailable = checkSeatIfAvailable(lastFilledSeat, newSeat);
    const isInCancelledSeats = flight.seats.seatMap[newSeatType].cancelledSeats.includes(newSeat);

    if (!isSeatAvailable && !isInCancelledSeats) {
      logger.warn("Seat is already filled", { newSeat });
      return res.status(400).json({ success: false, message: "Seat is already filled by another passenger." });
    }

    const passenger = booking.passengers.find(p => p.passengerNumber === passengerNumber);
    console.log(booking.passengers)
    if (!passenger) {
      logger.warn("Passenger not found", { passengerNumber });
      return res.status(404).json({ success: false, message: "Passenger not found." });
    }
    
    passenger.seatNumber = newSeat;
    await booking.save();
    logger.info("Seat updated successfully", { email, flightNumber, passengerNumber, newSeat });

    if (isInCancelledSeats) {
      const cancelledSeats = flight.seats.seatMap[newSeatType].cancelledSeats;
      flight.seats.seatMap[newSeatType].cancelledSeats = cancelledSeats.filter(seat => seat !== newSeat);
    }
    flight.seats.seatMap[seatType].cancelledSeats.push(lastFilledSeat);
    await flight.save();

    return res.status(200).json({ success: true, message: "Seat updated successfully.", booking });

};


module.exports = { modifySeatAssignment };
