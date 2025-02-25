const express = require("express");
const router = express.Router();
const { register, login } = require("./microservices/auth");
const asyncHandler = require("express-async-handler");
const authLimit = require("./rate-limit");
router.post(
  "/register",
  authLimit,
  asyncHandler((req, res) => register(req, res))
);

router.post(
  "/login",
  authLimit,
  asyncHandler((req, res) => login(req, res))
);
router.stack.forEach((route) => {
  console.log("harsha");

  if (route.route) {
    console.log("Hello ", route.route.path);
  }
});
module.exports = router;
