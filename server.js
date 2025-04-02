const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const cluster = require("cluster");
const logger = require("./logger/logger");
const os = require("os");
const morgan = require("morgan");

const numCPUs = os.cpus().length;

// Create Express app outside cluster logic
const app = express();

// Common middleware setup
app.use(express.json());
app.use(cors({
  origin: [process.env.origin, "http://localhost:4200"],
}));

app.use(morgan("combined", {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
}));

// MongoDB Connection (should happen once)
mongoose.connect(process.env.DBURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", () => console.log("Error in DB connection"));
db.once("open", () => console.log("DB connected"));

// Import routes
const { router } = require("./router");
app.use("/", router);

// Cluster logic
if (cluster.isMaster) {
  console.log(`Master process ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died, restarting...`);
    cluster.fork();
  });
} else {
  const PORT = process.env.AUTH_PORT || 8080;
  app.listen(PORT, () => console.log(`Worker ${process.pid} running on port ${PORT}`));
}

// Export the app for testing
module.exports = app;