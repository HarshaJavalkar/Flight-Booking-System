const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const { authLimit, flightLimit } = require("./rate-limit");

const { register, login } = require("./microservices/auth");
const { loginWithGoogle, callBack } = require("./microservices/googleAuth.js");
const {
  bookFlight,
} = require("./microservices/flight-booking-system/book_flight_ticket.js");
const {
  viewFlightTicket,
} = require("./microservices/flight-booking-system/view_flight_ticket.js");

const {
  createFlight,
} = require("./microservices/flight-booking-system/create_a_flight.js");

const {
  validateBookingRequest,
} = require("./middlewares/validatebookingDetails.js");
const {
  checkSeatAvailability,
} = require("./middlewares/checkSeatAvailability.js");

const {
  authenticate,
  adminMiddleware,
  userMiddleware,
} = require("./middlewares/authenticate.js");

router.post(
  "/register",
  authLimit,
  asyncHandler((req, res) => {
    return register(req, res);
  })
);
router.get(
  "/login-with-google",
  asyncHandler((req, res) => loginWithGoogle(req, res))
);

router.post(
  "/auth/callback",
  asyncHandler((req, res) => callBack(req, res))
);

router.post(
  "/login",
  authLimit,
  asyncHandler((req, res) => login(req, res))
);

router.post(
  "/create-a-flight",
  flightLimit,
  authenticate,
  adminMiddleware,
  createFlight
);
router.post(
  "/book-flight",
  flightLimit,
  userMiddleware,
  authenticate,
  validateBookingRequest,
  checkSeatAvailability,
  bookFlight
);

router.get("/view-flight-ticket", flightLimit, authenticate, viewFlightTicket);
// router.post("/update", authenticate, updateUserProfile);
router.stack.forEach((route) => {
  if (route.route) {
    console.log("route ", route.route.path);
  }
});
module.exports = { router };
