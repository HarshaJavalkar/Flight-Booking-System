const jwt = require("jsonwebtoken");
const fs = require("fs");

const publicKey = fs.readFileSync("public.pem", "utf8");

const decodeToken = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, publicKey);
      req.user = decoded; // Attach user data to request
    } catch (err) {
      console.log("Token decoding failed:", err.message);
      req.user = null; // Proceed without blocking
    }
  } else {
    req.user = null; // No token, but continue
  }

  next();
};

module.exports = { decodeToken };
