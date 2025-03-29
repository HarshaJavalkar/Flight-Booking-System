const rateLimit = require("express-rate-limit");
const config = require("./config/config");

const env = process.env.env || "dev";
const authLimit = rateLimit({
  windowMs: config[env].rateLimiter.rateLimitTimer,
  statusCode: config[env].rateLimiter.rateLimitErrorCode,
  max: config[env].rateLimiter.maxRequests,
  message: {
    error: config[env].rateLimiter.rateLimitErrorMessage,
    code: config[env].rateLimiter.rateLimitErrorProto,
  },
});

const flightLimit = rateLimit({
  windowMs: config[env].flightRateLimiter.rateLimitTimer,
  statusCode: config[env].flightRateLimiter.rateLimitErrorCode,
  max: config[env].flightRateLimiter.maxRequests,
  message: {
    error: config[env].flightRateLimiter.rateLimitErrorMessage,
    code: config[env].flightRateLimiter.rateLimitErrorProto,
  },
});

module.exports = { authLimit, flightLimit };
