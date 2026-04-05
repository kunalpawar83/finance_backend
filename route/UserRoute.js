const express = require("express");
const router = express.Router();
const UserController = require("../controller/userController.js");

router.post("/create", UserController.CreateUser);
router.post("/login",UserController.LoginUser);

module.exports = router;