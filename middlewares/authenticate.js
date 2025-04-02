const logger = require("../logger/logger");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticate = async (req, res, next, role) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Get token from header

    if (!token) {
      logger.error(`Unauthorized: No token provided`);
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    logger.info(`🔹 Received Token: ${token}`);
    const jwtSecret =
      role === "user"
        ? process.env.user_jwt_ENCRYPT_KEY
        : process.env.admin_jwt_ENCRYPT_KEY;
    if (!jwtSecret) {
      logger.error("❌ JWT Secret Key is missing in environment variables.");
      return res.status(500).json({ message: "Internal server error" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (err) {
      logger.error(`❌ Token verification failed: ${err.message}`);
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    logger.info(`✅ Decoded Token: ${JSON.stringify(decoded)}`);

    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      logger.error(`⚠️ User not found in DB for email: ${decoded.email}`);
      return res.status(401).json({ message: "User not found" });
    }
    req.body.email = decoded.email;
    req.body.user = user;
    logger.info(`✅ User '${user.email}' authenticated successfully`);
    next();
  } catch (error) {
    logger.error(`❌ Server Error in authentication: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { authenticate };
