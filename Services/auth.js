// routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const register = asyncHandler(async (req, res) => {
  console.log("Data received");
  const { username, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.json({ message: "User registered successfully" });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "User already exists" });
    }
    console.error("Error during registration:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id }, process.env.GITHUB_JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err });
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
