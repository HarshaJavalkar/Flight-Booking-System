const rateLimit = require("express-rate-limit");
const config = require("./config/config");
const authLimit = rateLimit({
  windowMs: config[process.env.env].rateLimiter.rateLimitTimer,
  statusCode: config[process.env.env].rateLimiter.rateLimitErrorCode,
  max: 5,
  message: {
    error: config[process.env.env].rateLimiter.rateLimitErrorMessage,
    code: config[process.env.env].rateLimiter.rateLimitErrorProto,
  },
});

module.exports = authLimit;
