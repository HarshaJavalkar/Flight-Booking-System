// routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const logger = require("../logger/logger");
const { error } = require("winston");
const register = asyncHandler(async (req, res) => {
  console.log("Data received");
  const { username, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    logger.info(`User ${username} registered successfully`);
    res.json({ message: "User registered successfully" });
  } catch (err) {
    if (err.code === 11000) {
      logger.error(`User ${username} already exists`);
      return res.status(400).json({ error: "User already exists" });
    }
    logger.error("Internal server error", { error: err });
    res.status(500).json({ error: "Internal server error" });
  }
});
const login = async (req, res) => {
  const { username, password } = req.body;
  logger.info(`🔹 Login attempt for user: ${username}`);

  try {
    const user = await User.findOne({ username });

    if (!user) {
      logger.warn(`⚠️ Login failed: User '${username}' not found`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`⚠️ Login failed: Incorrect password for user '${username}'`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.GITHUB_JWT_SECRET, {
      expiresIn: "1h",
    });
    logger.info(`✅ User '${username}' logged in successfully`);
    res.json({ token });
  } catch (err) {
    logger.error(`❌ Login error for user '${username}': ${err.message}`, {
      stack: err.stack,
    });
    res.status(500).json({ error: "Internal server error" });
  }
};
// Middleware to Verify Token
const authenticate = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ error: "Access Denied" });
  try {
    const verified = jwt.verify(token, process.env.GITHUB_JWT_SECRET);
    req.user = verified;
    next();
  } catch {
    res.status(400).json({ error: "Invalid Token" });
  }
};

module.exports = { register, login };
