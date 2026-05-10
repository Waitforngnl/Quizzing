require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');

// Import Models
const User = require('./models/user');
const Profile = require('./models/Profile');
const Question = require('./models/Question');
const Exam = require('./models/Exam'); 
const Result = require('./models/Result');
const classRoutes = require('./routes/classRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

connectDB();

app.use(cors());
app.use(express.json());
app.use('/api/classes', classRoutes);

// --- MIDDLEWARE XÁC THỰC (Dùng để lấy thông tin cá nhân an toàn) ---
const authorize = (roles = []) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ message: 'Bạn cần đăng nhập' });

        const token = authHeader.split(" ")[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
            if (roles.length && !roles.includes(decoded.role)) {
                return res.status(403).json({ message: 'Không có quyền truy cập' });
            }
            req.user = decoded; // Lưu id và role vào req.user
            next();
        } catch (err) {
            res.status(401).json({ message: 'Token không hợp lệ' });
        }
    };
};

// --- 1. ĐĂNG KÝ (Sửa lại để tạo cả Profile) ---
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password, role, fullName, phoneNumber, ...otherProfileInfo } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Email đã tồn tại' });

        // Tạo User
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({ username, email, password: password, role });
        const savedUser = await newUser.save();

        // Tạo Profile liên kết với User vừa tạo
        const newProfile = new Profile({
            user: savedUser._id,
            fullName: fullName || username, // Nếu không gửi fullName thì lấy tạm username
            phoneNumber,
            ...otherProfileInfo
        });
        await newProfile.save();

        res.status(201).json({ message: 'Đăng ký tài khoản và hồ sơ thành công' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
});

// --- 2. LẤY THÔNG TIN CÁ NHÂN (Profile) ---
app.get('/api/profile/me', authorize(), async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id })
            .populate('user', ['name', 'email', 'role']);
        
        if (!profile) return res.status(404).json({ message: 'Không tìm thấy hồ sơ' });
        res.json(profile);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// --- 3. CẬP NHẬT THÔNG TIN CÁ NHÂN ---
app.put('/api/profile/me', authorize(), async (req, res) => {
    try {
        const updates = req.body;
        const profile = await Profile.findOneAndUpdate(
            { user: req.user.id },
            { $set: updates },
            { new: true }
        );
        res.json({ message: 'Cập nhật thành công', profile });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi cập nhật hồ sơ' });
    }
});

// --- CÁC ROUTE AUTH KHÁC ---
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Email không tồn tại' });
    if (role && user.role !== role) return res.status(403).json({ message: 'Vai trò không hợp lệ' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Mật khẩu không đúng' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1d' });
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// --- QUẢN LÝ CÂU HỎI & KỲ THI (Giữ nguyên của bạn) ---
app.post('/api/questions', async (req, res) => {
  try {
    const newQuestion = new Question(req.body);
    const savedQuestion = await newQuestion.save();
    res.status(201).json(savedQuestion);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi tạo câu hỏi', error: err.message });
  }
});

app.get('/api/questions', async (req, res) => {
  try {
    const { subject, grade, difficulty } = req.query;
    let filter = {};
    if (subject) filter.subject = subject;
    if (grade) filter.grade = grade;
    if (difficulty) filter.difficulty = difficulty;
    const questions = await Question.find(filter).sort({ createdAt: -1 });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách', error: err.message });
  }
});

app.post('/api/exams', async (req, res) => {
  try {
    const { title, description, startTime, endTime, questionIds, creator } = req.body;
    const selectedQuestions = await Question.find({ _id: { $in: questionIds } });
    if (selectedQuestions.length === 0) {
      return res.status(400).json({ message: 'Không tìm thấy câu hỏi nào được chọn' });
    }
    const examQuestions = selectedQuestions.map(q => ({
      questionText: q.content,
      options: q.options.map(opt => opt.text),
      correctOption: q.correctAnswer === 'A' ? 0 : q.correctAnswer === 'B' ? 1 : q.correctAnswer === 'C' ? 2 : 3
    }));
    const newExam = new Exam({
      title,
      description,
      creator,
      startTime,
      endTime,
      questions: examQuestions
    });
    await newExam.save();
    res.status(201).json({ message: 'Tạo bài thi thành công!', examId: newExam._id });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi tạo bài thi', error: err.message });
  }
});

app.get('/api/exams', async (req, res) => {
  try {
    const exams = await Exam.find().sort({ startTime: 1 });
    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách bài thi' });
  }
});

app.get('/api/exams/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const exams = await Exam.find().sort({ startTime: 1 });
    const results = await Result.find({ student: studentId }, 'exam');
    const completedExamIds = results.map(r => r.exam.toString());

    const examsWithStatus = exams.map(exam => ({
      ...exam._doc,
      isCompleted: completedExamIds.includes(exam._id.toString())
    }));

    res.json(examsWithStatus);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách bài thi', error: err.message });
  }
});

app.post('/api/results/submit', async (req, res) => {
  try {
    const { examId, studentId, studentAnswers } = req.body;
    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Không tìm thấy bài thi' });

    let correctCount = 0;
    const processedAnswers = exam.questions.map((q, index) => {
      const selected = studentAnswers[index];
      const isCorrect = selected === q.correctOption;
      if (isCorrect) correctCount++;
      return {
        questionText: q.questionText,
        selectedOption: selected !== undefined ? selected : -1,
        correctOption: q.correctOption,
        isCorrect: isCorrect
      };
    });

    const score = (correctCount / exam.questions.length) * 10;
    const newResult = new Result({
      student: studentId,
      exam: examId,
      answers: processedAnswers,
      score: Number(score.toFixed(2)),
      totalQuestions: exam.questions.length,
      correctCount: correctCount
    });

    await newResult.save();
    res.status(201).json({ message: 'Nộp bài thành công', score: newResult.score });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server khi lưu kết quả' });
  }
});

app.get('/api/results/student/:studentId', async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const results = await Result.find({ student: studentId })
      .populate('exam', 'title')
      .sort({ completedAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy dữ liệu' });
  }
});

// Thống kê & Bài thi gần đây (Giữ nguyên)
app.get('/api/teacher/stats', async (req, res) => {
  try {
    const totalExams = await Exam.countDocuments();
    const totalQuestions = await Question.countDocuments();
    const totalResults = await Result.countDocuments();
    const studentsParticipated = await Result.distinct('student');

    res.json({
      totalExams,
      totalQuestions,
      totalResults,
      totalStudents: studentsParticipated.length
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy thống kê giáo viên' });
  }
});

app.get('/api/teacher/recent-exams', async (req, res) => {
  try {
    const exams = await Exam.find().sort({ createdAt: -1 }).limit(5);
    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy danh sách bài thi gần đây' });
  }
});

app.get('/api/results/exam/:examId', async (req, res) => {
  try {
    const results = await Result.find({ exam: req.params.examId })
      .populate('student', 'name email')
      .sort({ score: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách điểm" });
  }
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại port: ${PORT}`);
});