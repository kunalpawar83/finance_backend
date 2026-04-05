const express = require('express');
const recordController = require('../controller/recordController');
const { protect, restrictTo } = require('../middlewares/auth');
const router = express.Router();

router.post('/create', protect, restrictTo("Admin", "Analyst"), recordController.createRecord);

router.get('/', protect, recordController.getAllRecords);

router.patch('/update/:id', protect, restrictTo("Admin"), recordController.updateRecord);

router.patch('/delete/:id', protect, restrictTo("Admin"), recordController.deleteRecord);

router.get('/delete', protect, restrictTo("Admin"), recordController.getAllDeleteRecords);

module.exports = router;