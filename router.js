const express = require("express");
const router = express.Router();
const {register} = require("./microservices/auth");
const asyncHandler= require("express-async-handler");
console.log("Router initialized");



router.post('register', (req, res) => {
    console.log("Incoming request to /register");
    if (!register) {
        console.error("❌ register function is undefined!");
        return res.status(500).json({ error: "Register function not found" });
    }
    register(req, res);
});
console.log("Defined Routes:");
router.stack.forEach(route => {
    console.log("harsha")

    if (route.route) {
        console.log("Hello ", route.route.path);
    }
});
module.exports = router;
