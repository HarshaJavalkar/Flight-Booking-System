const express = require("express");
const router = express.Router();
const { register, login } = require("./microservices/auth");
const asyncHandler = require("express-async-handler");
console.log("Router initialized");

router.post(
  "/register",
  asyncHandler((req, res) => register(req, res))
);

router.post(
  "/login",
  asyncHandler((req, res) => login(req, res))
);
router.stack.forEach((route) => {
  console.log("harsha");

  if (route.route) {
    console.log("Hello ", route.route.path);
  }
});
module.exports = router;
