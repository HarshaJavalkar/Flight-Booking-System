const rateLimit = require("express-rate-limit");
const config = require("./config/config");
console.log("Javalkar",config[process.env.env].rateLimiter)
const env = process.env.env ||  'dev';
const authLimit = rateLimit({
  windowMs: config[env].rateLimiter.rateLimitTimer,
  statusCode: config[env].rateLimiter.rateLimitErrorCode,
  max: 5,
  message: {
    error: config[env].rateLimiter.rateLimitErrorMessage,
    code: config[env].rateLimiter.rateLimitErrorProto,
  },
});

module.exports = authLimit;
