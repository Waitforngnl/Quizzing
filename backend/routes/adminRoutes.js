const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Thống kê hệ thống: GET /api/admin/stats
router.get('/stats', adminController.getAdminStats);

// Lấy danh sách user: GET /api/admin/users
router.get('/users', adminController.getAllUsers);

// Cập nhật user: PUT /api/admin/users/:id
router.put('/users/:id', adminController.updateUser);

// Xóa user: DELETE /api/admin/users/:id
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;