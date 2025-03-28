const cors = require("cors");

const corsOptions = {
  origin: "*", // ✅ Allow Angular client
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // ✅ Allow cookies and authorization headers
  allowedHeaders: ["Content-Type", "Authorization"],
};

module.exports = cors(corsOptions);
