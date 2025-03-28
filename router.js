const express = require("express");
const router = express.Router();
const { register, login, authenticate } = require("./microservices/auth");
const { loginWithGoogle, callBack } = require("./microservices/googleAuth.js");
const asyncHandler = require("express-async-handler");
const authLimit = require("./rate-limit");
const { updateUserProfile } = require("./microservices/userService.js");
const app = express();
const {
  homeLoanEligibility,
} = require("./microservices/home-loan-eligibility.js");

router.post(
  "/register",
  authLimit,
  asyncHandler((req, res) => {    
    return register(req, res)})
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
  "/home-loan-eligibility",
  authLimit,
  asyncHandler((req, res) => homeLoanEligibility(req, res))
);

router.post("/update", authenticate, updateUserProfile);
router.stack.forEach((route) => {
  if (route.route) {
    console.log("Hello ", route.route.path);
  }
});
module.exports = router;
