const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
  })
);

// Define transports (Console + File Rotation)
const logger = winston.createLogger({
  level: "info",
  format: logFormat,
  transports: [
    new winston.transports.Console(), // Console
    new DailyRotateFile({
      dirname: "logs",
      filename: "server-%DATE%.log",
      datePattern: "DD-MM-YYYY",
      maxFiles: "14d",
      level: "info",
      zippedArchive: false, // Disable log compression
      sync: true, // ✅ Force synchronous writes
    }),
  ],
});
logger.stream = {
  write: (message) => {
    logger.info(message.trim()); // Trim to remove extra newlines
  },
};

// Export logger
module.exports = logger;
