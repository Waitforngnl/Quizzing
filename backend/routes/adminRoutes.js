const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Định nghĩa endpoint: GET /api/admin/stats
router.get('/stats', adminController.getAdminStats);

module.exports = router;