// routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const logger = require("../logger/logger");

const { error } = require("winston");
const register = asyncHandler(async (req, res) => {
  const {
    email,
    password,
    googleId = "",
    name,
    photo = "",
    isGoogleLogin = false,
    role = "user",
  } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.error(`User ${email} already exists`);
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password if not a Google login
    const hashedPassword = isGoogleLogin
      ? password
      : await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      photo,
      googleId,
      role,
    });
    console.log(newUser);
    await newUser.save();
    logger.info(`User ${email} registered successfully`);

    // Auto-login after successful registration (optional)
    return login(req, res);
  } catch (err) {
    logger.error("Internal server error", { error: err });
    return res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
});

const login = async (req, res) => {
  const {
    email,
    password,
    googleId = "",
    name,
    photo = "",
    isGoogleLogin = false,
    role = "user",
  } = req.body;

  logger.info(`🔹 Login attempt for user: ${email}`);

  if (!isGoogleLogin) {
    logger.info("login using username and password")

    try {
      const user = await User.findOne({ email });

      if (!user) {
        logger.warn(`⚠️ Login failed: User '${email}' not found`);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        logger.warn(`⚠️ Login failed: Incorrect password for user '${email}'`);
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const jwtSecret =
        role === "user"
          ? process.env.user_jwt_ENCRYPT_KEY
          : process.env.admin_jwt_ENCRYPT_KEY;
      const token = jwt.sign({ email: user.email }, jwtSecret, {
        expiresIn: "1h",
      });

      logger.info(`✅ User '${email}' logged in successfully`);
      return res.json({ token });
    } catch (err) {
      logger.error(`❌ Login error for user '${email}': ${err.message}`, {
        stack: err.stack,
      });
      return res.status(500).json({ error: "Internal server error" });
    }
  }
  const jwtSecret =
    role === "user"
      ? process.env.user_jwt_ENCRYPT_KEY
      : process.env.admin_jwt_ENCRYPT_KEY;
  // Google login case
  const token = jwt.sign({ email: user.email }, jwtSecret, {
    expiresIn: "1h",
  });

  logger.info(`✅ User '${email}' logged in successfully`);
  return res.json({ token: token, userData: { email, name, photo } });
};

module.exports = { register, login };
