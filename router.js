const express = require("express");
const router = express.Router();
const { register, login } = require("./microservices/auth");
const { loginWithGoogle, callBack } = require("./microservices/googleAuth.js");
const asyncHandler = require("express-async-handler");
const authLimit = require("./rate-limit");
const app = express();

router.post(
  "/register",
  authLimit,
  asyncHandler((req, res) => register(req, res))
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
router.stack.forEach((route) => {
  console.log("harsha");

  if (route.route) {
    console.log("Hello ", route.route.path);
  }
});
module.exports = router;
