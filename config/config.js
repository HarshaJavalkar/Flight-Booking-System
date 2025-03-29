const logger = require("../logger/logger");
const env = process.env.env;
logger.info(`config loaded successfully for ${env}`);

const config = {
  dev: {
    rateLimiter: {
      rateLimitTimer: 1000,
      maxRequests: 10,
      rateLimitErrorCode: 429,
      rateLimitErrorMessage:
        "Too many authentication requests. Please try again later.",
      rateLimitErrorProto: "AUTH_RATE_LIMIT_EXCEEDED",
    },

    flightRateLimiter: {
      rateLimitTimer: 1000,
      maxRequests: 10,
      rateLimitErrorCode: 429,
      rateLimitErrorMessage:
        "Too many flight requests. Please try again later.",
      rateLimitErrorProto: "FLIGHT_RATE_LIMIT_EXCEEDED",
    },
  },
  prod: {
    rateLimiter: {
      rateLimitTimer: 1000,
      maxRequests: 10,
      rateLimitErrorCode: 429,
      rateLimitErrorMessage:
        "Too many authentication requests. Please try again later.",
      rateLimitErrorProto: "AUTH_RATE_LIMIT_EXCEEDED",
    },

    flightRateLimiter: {
      rateLimitTimer: 1000,
      maxRequests: 10,
      rateLimitErrorCode: 429,
      rateLimitErrorMessage:
        "Too many flight requests. Please try again later.",
      rateLimitErrorProto: "FLIGHT_RATE_LIMIT_EXCEEDED",
    },
  },
};

module.exports = config;
