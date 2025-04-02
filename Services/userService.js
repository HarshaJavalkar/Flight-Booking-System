const express = require("express");

const app = express();
const expressAsyncHandler = require("express-async-handler");

const updateUserProfile = expressAsyncHandler(async (req, res) => {});

module.exports = { updateUserProfile };
