const mongoose = require("mongoose");
const mailChecker = require("mailchecker");
const validator = require("validator");

const UserSchema = new mongoose.Schema({
  role: { type: String, default: () => "user" },
  password: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (value) {
        try {
          if (validator.isEmail(value) && mailChecker.isValid(value)) {
            return true;
          }
          logger.error(`Error in ${filePath}: ${error.message} email ${value}`);

          throw new Error("Invalid email or blacklisted domain");
        } catch (error) {
          const filePath = path.basename(__filename); // Get the current file name
          logger.error(`Error in ${filePath}: ${error.message}`);
          return false;
        }
      },
      message: "Invalid or temporary email address",
    },
  },
  name: { type: String, required: true },
  photo: { type: String }, // Store photo URL
});

const User = mongoose.model("UserData", UserSchema, "users");

module.exports = User;
