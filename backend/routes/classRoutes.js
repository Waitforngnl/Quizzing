const express = require('express');
const router = express.Router();
const Class = require('../models/Class');
const User = require('../models/user'); // Đảm bảo đường dẫn này đúng với model User của bạn
const { protect, teacherOnly } = require('../middleware/authMiddleware');

// 1. [POST] Tạo lớp mới (Chỉ Giáo viên)
router.post('/create', protect, teacherOnly, async (req, res) => {
  try {
    const { className } = req.body;
    const newClass = new Class({
      className,
      teacherId: req.user.id
    });
    
    await newClass.save();
    res.status(201).json(newClass);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi tạo lớp học', error: err.message });
  }
});

// 2. [GET] Lấy danh sách lớp do Giáo viên tạo
router.get('/', protect, teacherOnly, async (req, res) => {
  try {
    const classes = await Class.find({ teacherId: req.user.id }).sort({ createdAt: -1 });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy danh sách lớp' });
  }
});

// 3. [GET] Lấy chi tiết một lớp (bao gồm danh sách sinh viên)
router.get('/:id', protect, async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
      .populate('students', 'username email'); // Lấy thông tin name/email để hiện thị ở ClassDetail.jsx
    
    if (!classData) return res.status(404).json({ message: 'Không tìm thấy lớp học' });
    res.json(classData);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy chi tiết lớp' });
  }
});

// 4. [POST] Thêm sinh viên thủ công bằng Email
router.post('/:id/add-student', protect, teacherOnly, async (req, res) => {
  try {
    const { email } = req.body;
    // Tìm sinh viên trong hệ thống
    const student = await User.findOne({ email });
    
    if (!student) return res.status(404).json({ message: 'Không tìm thấy sinh viên với email này' });

    const targetClass = await Class.findById(req.params.id);
    // Tránh thêm trùng lặp
    if (targetClass.students.includes(student._id)) {
      return res.status(400).json({ message: 'Sinh viên này đã có trong lớp' });
    }

    targetClass.students.push(student._id);
    await targetClass.save();
    res.json({ message: 'Đã thêm sinh viên thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi thêm sinh viên' });
  }
});

// 5. [POST] Import sinh viên hàng loạt (Dành cho tính năng Excel)
router.post('/:id/import-students', protect, teacherOnly, async (req, res) => {
  try {
    const { emails } = req.body; // Mảng các email từ file Excel gửi lên
    
    // Tìm tất cả ID của sinh viên có email nằm trong danh sách
    const students = await User.find({ email: { $in: emails } });
    const studentIds = students.map(s => s._id);

    // Sử dụng $addToSet để thêm ID vào mảng mà không sợ bị trùng
    await Class.findByIdAndUpdate(req.params.id, {
      $addToSet: { students: { $each: studentIds } }
    });

    res.json({ message: 'Import danh sách sinh viên thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi import sinh viên' });
  }
});

// 6. [POST] Tham gia lớp học (Dành cho Học sinh tự nhập mã)
router.post('/join', protect, async (req, res) => {
  try {
    const { joinCode } = req.body;
    const studentId = req.user.id;

    const targetClass = await Class.findOne({ joinCode });
    if (!targetClass) {
      return res.status(404).json({ message: 'Mã lớp không tồn tại' });
    }

    if (targetClass.students.includes(studentId)) {
      return res.status(400).json({ message: 'Bạn đã tham gia lớp này rồi' });
    }

    targetClass.students.push(studentId);
    await targetClass.save();

    res.json({ message: 'Tham gia lớp thành công', className: targetClass.className });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi tham gia lớp' });
  }
});

module.exports = router;