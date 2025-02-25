const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const morgan = require("morgan");

app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.DBURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const logger = require("./logger/logger");
logger.info("🔹 Winston logger initialized");
morgan.token("username", (req) => {
  return req.body?.username || req.user?.username || "anonymous"; // Handle different cases
});

const customFormat = (tokens, req, res) => {
  return JSON.stringify({
    username: tokens.username(req), // ✅ Add username field
    timestamp: tokens.date(req, res, "iso"), // ISO timestamp
    method: tokens.method(req, res), // HTTP Method
    url: tokens.url(req, res), // Request URL
    status: tokens.status(req, res), // Status code
    response_time: tokens["response-time"](req, res) + "ms", // Response time
    user_agent: tokens["user-agent"](req, res), // User agent
    ip: tokens["remote-addr"](req, res), // IP Address
  });
};

// ✅ Apply Morgan with Winston
app.use(
  morgan(customFormat, {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

const db = mongoose.connection;
db.on("error", () => console.log("Error in DB connection"));
db.once("open", () => console.log("DB connected"));

// Use Router
console.log("Registering routes...");
const router = require("./router");

app.use("/", router);

app.use((req, res, next) => {
  console.log(`🟡 Incoming request: ${req.method} ${req.url}`);
  next();
});
const PORT = process.env.AUTH_PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
