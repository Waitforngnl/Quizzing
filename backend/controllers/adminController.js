const User = require('../models/user'); // Đảm bảo đúng tên file User.js
const Exam = require('../models/Exam'); // Đảm bảo đúng tên file Exam.js

exports.getAdminStats = async (req, res) => {
  try {
    // Đếm dữ liệu thời gian thực dựa trên các tiêu chí trong Database
    const [totalUsers, totalTeachers, totalStudents, totalExams] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: 'teacher' }),
      User.countDocuments({ role: 'student' }),
      Exam.countDocuments({})
    ]);

    res.status(200).json({
      totalUsers,
      totalTeachers,
      totalStudents,
      totalExams
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy thống kê admin', error: err.message });
  }
};