const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // ==========================================
  // TÍNH NĂNG MỚI: Liên kết bài thi với Lớp học
  classId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Class' 
    // Lưu ý: Tạm thời không để required: true để các bài thi cũ bạn đã tạo trước đây không bị báo lỗi.
  },

  // TÍNH NĂNG MỚI: Giới hạn số lần thi (bạn đã yêu cầu ở phần trước)
  maxAttempts: { 
    type: Number, 
    default: 1 
  },
  // ==========================================

  subject: { type: String },
  grade: { type: String },
  durationMinutes: { type: Number },
  passMark: { type: Number, default: 5 },
  randomizeQuestions: { type: Boolean, default: false },
  showAnswersAfterExam: { type: Boolean, default: false },
  status: { type: String, enum: ['Đang diễn ra','Đã kết thúc'], default: 'Đang diễn ra' },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  questions: [{
    questionText: { type: String, required: true },
    options: {
      type: [String],
      validate: [v => v.length === 4, 'Phải có đúng 4 đáp án']
    },
    correctOption: { type: Number, required: true, min: 0, max: 3 }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Exam', ExamSchema);