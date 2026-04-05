const express = require('express');
const dashboardController = require('../controller/dashboardController');
const { protect, restrictTo } = require('../middlewares/auth');
const router = express.Router();

router.use(protect);
router.use(restrictTo('Admin', 'Analyst', 'Viewer'));

router.get('/summary', dashboardController.getSummary);
router.get('/trends', dashboardController.getTrends);

module.exports = router;
