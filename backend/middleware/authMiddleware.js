const jwt = require('jsonwebtoken');

// Middleware 1: Kiểm tra xem người dùng đã đăng nhập chưa (Có token hợp lệ không)
const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Bạn cần đăng nhập để thực hiện chức năng này' });
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
        req.user = decoded; // Gắn thông tin user (gồm id và role) vào request để các route khác xài
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
};

// Middleware 2: Phân quyền, kiểm tra xem người dùng có phải là Giáo viên không
const teacherOnly = (req, res, next) => {
    // Tùy thuộc vào cách bạn lưu role trong DB là 'Giáo viên', 'teacher' hay 'Teacher'
    if (req.user && (req.user.role === 'Giáo viên' || req.user.role === 'teacher' || req.user.role === 'Teacher')) {
        next();
    } else {
        res.status(403).json({ message: 'Từ chối truy cập! Chức năng này chỉ dành cho Giáo viên.' });
    }
};

module.exports = { protect, teacherOnly };