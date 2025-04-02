const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const { authLimit, flightLimit } = require("./rate-limit");
const logger = require("./logger/logger.js")
const { register, login } = require("./Services/auth");
const { loginWithGoogle, callBack } = require("./Services/googleAuth.js");
const {
  bookFlight,
} = require("./Services/flight-booking-system/book_flight_ticket.js");
const {
  viewFlightTicket,
} = require("./Services/flight-booking-system/view_flight_ticket.js");
const {
  createFlight,
} = require("./Services/flight-booking-system/create_a_flight.js");
const {
  cancelFlightTicket,
} = require("./Services/flight-booking-system/cancel_flight_ticket.js");
const {
  viewAllPassengers,
} = require("./Services/flight-booking-system/view_all_passengers.js");
const {
  modifySeatAssignment,
} = require("./Services/flight-booking-system/modify_seat_assignment.js");

const {
  validateBookingRequest,
} = require("./middlewares/validatebookingDetails.js");
const {
  checkSeatAvailability,
} = require("./middlewares/checkSeatAvailability.js");

const { authenticate } = require("./middlewares/authenticate.js");

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
  asyncHandler((req, res, next) => authenticate(req, res, next, "admin")),
  createFlight
);
router.post(
  "/book-flight",
  flightLimit,
  asyncHandler((req, res, next) => authenticate(req, res, next, "user")),
  validateBookingRequest,
  checkSeatAvailability,
  bookFlight
);
router.put(
  "/cancel-flight-ticket",
  flightLimit,
  asyncHandler((req, res, next) => authenticate(req, res, next, "user")),
  cancelFlightTicket
);
router.put(
  "/modify-seat",
  flightLimit,
  asyncHandler((req, res, next) => authenticate(req, res, next, "user")),
  modifySeatAssignment
);

router.post(
  "/view-all-passengers",
  flightLimit,
  asyncHandler((req, res, next) => authenticate(req, res, next, "admin")),
  viewAllPassengers
);
router.get(
  "/view-flight-ticket",
  flightLimit,
  asyncHandler((req, res, next) => authenticate(req, res, next, "user")),
  viewFlightTicket
);
// router.post("/update", authenticate, updateUserProfile);
function logRoutes(router) {
  router.stack.forEach((layer) => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
      logger.info(`Route registered: ${methods} ${layer.route.path}`);
    } else if (layer.name === 'router') {
      // Handle nested routers if any
      logRoutes(layer.handle);
    }
  });
}

// Call it after all routes are defined
logRoutes(router);
module.exports = { router };
