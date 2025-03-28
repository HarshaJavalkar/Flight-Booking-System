const logger = require("../logger/logger");
const env = process.env.env;
logger.info(`config loaded successfully for ${env}`);

const config = {
  dev: {
    rateLimiter: {
      rateLimitTimer: 10000,
      rateLimitErrorCode: 429,
      rateLimitErrorMessage: "Too many requests",
      rateLimitErrorProto: "RATE_LIMIT_EXCEEDED",
    },
  },
  prod: {
    rateLimiter: {
      rateLimitTimer: 5000, // Lower limit for production
      rateLimitErrorCode: 429,
      rateLimitErrorMessage: "Too many requests",
      rateLimitErrorProto: "RATE_LIMIT_EXCEEDED",
    },
  },
};

module.exports = config;
