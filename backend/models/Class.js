const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
  className: { 
    type: String, 
    required: [true, 'Tên lớp không được để trống'],
    trim: true 
  },
  teacherId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  // Danh sách ID sinh viên đã tham gia lớp
  students: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  // Mã tham gia lớp (ví dụ: A7B2X1)
  joinCode: { 
    type: String, 
    unique: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

ClassSchema.pre('save', async function() {
  if (!this.joinCode) {
    this.joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
});
module.exports = mongoose.model('Class', ClassSchema);