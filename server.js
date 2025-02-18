const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.DBURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", () => console.log("Error in DB connection"));
db.once("open", () => console.log("DB connected"));

// Use Router
console.log("Registering routes...");
const router = require("./router"); 

app.use("/", router); 

app.use((req, res, next) => {
    console.log(`🟡 Incoming request: ${req.method} ${req.url}`);
    next();
});
const PORT = process.env.AUTH_PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
