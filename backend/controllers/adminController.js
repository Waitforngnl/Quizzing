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
}

// Lấy danh sách tất cả người dùng (Không trả về password)
exports.getAllUsers = async (req, res) => {
  try {
    // Lấy tất cả user, bỏ trường password, xếp tài khoản mới tạo lên đầu
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    // Ánh xạ 'username' từ DB thành 'name' để Front-end hiển thị đúng u.name
    const mappedUsers = users.map(user => ({
      _id: user._id,
      name: user.username, // Khớp với trường {u.name} ở file AdminUsers.jsx của bạn
      email: user.email,
      role: user.role,
      createdAt: user.createdAt // Tự động sinh ra nếu schema có { timestamps: true }
    }));

    res.status(200).json(mappedUsers);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách user', error: err.message });
  }
};

// Cập nhật thông tin người dùng (Sửa)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    // Kiểm tra trùng lặp email với các tài khoản khác (trừ chính nó)
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email này đã được sử dụng bởi tài khoản khác' });
      }
    }

    // Ánh xạ ngược 'name' từ Client về lại 'username' của Database
    const updateData = {
      username: name,
      email,
      role
    };

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true } // new: true để trả về data sau khi sửa
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.status(200).json({ message: 'Cập nhật tài khoản thành công', user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi cập nhật user', error: err.message });
  }
};

// Xóa người dùng
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng để xóa' });
    }

    res.status(200).json({ message: 'Xóa người dùng thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi xóa user', error: err.message });
  }
};