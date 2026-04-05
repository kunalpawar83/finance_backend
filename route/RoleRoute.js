const express = require('express');
const router = express.Router();
const Role = require("../controller/roleController.js");


router.post('/create', Role.CreateRole);



module.exports = router;