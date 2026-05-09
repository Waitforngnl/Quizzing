const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

const User = require('./models/user');
const Question = require('./models/Question');
const Exam = require('./models/Exam');
const Result = require('./models/Result');

dotenv.config();

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const createOptions = (correctText, wrongAnswers) => {
  let distinctWrongs = [...new Set(wrongAnswers)].filter(w => w !== correctText);
  while (distinctWrongs.length < 3) {
    distinctWrongs.push(`${correctText} wrong ${distinctWrongs.length}`);
  }
  distinctWrongs = distinctWrongs.slice(0, 3);

  const allOpts = [
    { text: correctText, isCorrect: true },
    { text: distinctWrongs[0], isCorrect: false },
    { text: distinctWrongs[1], isCorrect: false },
    { text: distinctWrongs[2], isCorrect: false }
  ];

  shuffleArray(allOpts);

  const labels = ['A', 'B', 'C', 'D'];
  let correctLabel = '';
  const finalOptions = allOpts.map((opt, i) => {
    if (opt.isCorrect) correctLabel = labels[i];
    return { key: labels[i], text: opt.text };
  });

  return { options: finalOptions, correctAnswer: correctLabel };
};

const LITERATURE_DB = [
  { author: 'Nguyễn Du', work: 'Truyện Kiều', type: 'Truyện thơ' },
  { author: 'Nam Cao', work: 'Chí Phèo', type: 'Truyện ngắn' },
  { author: 'Kim Lân', work: 'Vợ Nhặt', type: 'Truyện ngắn' },
  { author: 'Tố Hữu', work: 'Việt Bắc', type: 'Thơ' },
  { author: 'Hồ Xuân Hương', work: 'Bánh Trôi Nước', type: 'Thơ' },
  { author: 'Xuân Diệu', work: 'Vội Vàng', type: 'Thơ' },
  { author: 'Huy Cận', work: 'Tràng Giang', type: 'Thơ' },
  { author: 'Nguyễn Tuân', work: 'Người lái đò sông Đà', type: 'Tùy bút' },
  { author: 'Tô Hoài', work: 'Vợ chồng A Phủ', type: 'Truyện ngắn' },
  { author: 'Quang Dũng', work: 'Tây Tiến', type: 'Thơ' },
  { author: 'Nguyễn Minh Châu', work: 'Chiếc thuyền ngoài xa', type: 'Truyện ngắn' },
  { author: 'Lưu Quang Vũ', work: 'Hồn Trương Ba, da hàng thịt', type: 'Kịch' },
  { author: 'Nguyễn Trãi', work: 'Bình Ngô đại cáo', type: 'Cáo' },
  { author: 'Hàn Mặc Tử', work: 'Đây thôn Vĩ Dạ', type: 'Thơ' },
  { author: 'Thạch Lam', work: 'Hai đứa trẻ', type: 'Truyện ngắn' },
  { author: 'Vũ Trọng Phụng', work: 'Số đỏ', type: 'Tiểu thuyết' },
  { author: 'Nam Cao', work: 'Đời thừa', type: 'Truyện ngắn' },
  { author: 'Thanh Thảo', work: 'Đàn ghi ta của Lor-ca', type: 'Thơ' },
  { author: 'Nguyễn Khoa Điềm', work: 'Đất Nước', type: 'Trường ca' },
  { author: 'Xuân Quỳnh', work: 'Sóng', type: 'Thơ' },
  { author: 'Nguyễn Trung Thành', work: 'Rừng xà nu', type: 'Truyện ngắn' },
  { author: 'Hoàng Phủ Ngọc Tường', work: 'Ai đã đặt tên cho dòng sông', type: 'Bút ký' },
  { author: 'Lý Bạch', work: 'Hoàng Hạc Lâu', type: 'Thơ Đường' },
  { author: 'Đỗ Phủ', work: 'Thu Hứng', type: 'Thơ Đường' },
  { author: 'Hồ Chí Minh', work: 'Tuyên ngôn Độc lập', type: 'Văn chính luận' },
  { author: 'Hồ Chí Minh', work: 'Nhật ký trong tù', type: 'Thơ' },
  { author: 'Chế Lan Viên', work: 'Tiếng hát con tàu', type: 'Thơ' },
  { author: 'Nguyễn Khuyến', work: 'Thu Điếu', type: 'Thơ' },
  { author: 'Tố Hữu', work: 'Từ ấy', type: 'Thơ' },
  { author: 'Nguyễn Ái Quốc', work: 'Vi hành', type: 'Truyện ngắn' }
];

const ENGLISH_DB = [
  { word: 'Beautiful', mean: 'Đẹp', syn: 'Pretty' },
  { word: 'Fast', mean: 'Nhanh', syn: 'Quick' },
  { word: 'Happy', mean: 'Hạnh phúc', syn: 'Joyful' },
  { word: 'Difficult', mean: 'Khó khăn', syn: 'Hard' },
  { word: 'Important', mean: 'Quan trọng', syn: 'Vital' },
  { word: 'Start', mean: 'Bắt đầu', syn: 'Begin' },
  { word: 'Smart', mean: 'Thông minh', syn: 'Clever' },
  { word: 'Big', mean: 'To lớn', syn: 'Huge' },
  { word: 'Small', mean: 'Nhỏ bé', syn: 'Tiny' },
  { word: 'Rich', mean: 'Giàu có', syn: 'Wealthy' },
  { word: 'Tired', mean: 'Mệt mỏi', syn: 'Exhausted' },
  { word: 'Funny', mean: 'Hài hước', syn: 'Hilarious' },
  { word: 'Sad', mean: 'Buồn bã', syn: 'Unhappy' },
  { word: 'Angry', mean: 'Tức giận', syn: 'Furious' },
  { word: 'Scared', mean: 'Sợ hãi', syn: 'Afraid' },
  { word: 'Delicious', mean: 'Ngon', syn: 'Tasty' },
  { word: 'Clean', mean: 'Sạch sẽ', syn: 'Spotless' },
  { word: 'Dirty', mean: 'Bẩn', syn: 'Filthy' },
  { word: 'Easy', mean: 'Dễ dàng', syn: 'Simple' },
  { word: 'Cheap', mean: 'Rẻ', syn: 'Inexpensive' },
  { word: 'Interesting', mean: 'Thú vị', syn: 'Fascinating' },
  { word: 'Boring', mean: 'Nhàm chán', syn: 'Dull' },
  { word: 'Cold', mean: 'Lạnh', syn: 'Chilly' },
  { word: 'Hot', mean: 'Nóng', syn: 'Boiling' },
  { word: 'Dangerous', mean: 'Nguy hiểm', syn: 'Risky' },
  { word: 'Safe', mean: 'An toàn', syn: 'Secure' },
  { word: 'Strong', mean: 'Mạnh mẽ', syn: 'Powerful' },
  { word: 'Weak', mean: 'Yếu đuối', syn: 'Fragile' },
  { word: 'New', mean: 'Mới', syn: 'Modern' },
  { word: 'Old', mean: 'Cũ', syn: 'Ancient' }
];

shuffleArray(LITERATURE_DB);
shuffleArray(ENGLISH_DB);

const generateMathQuestion = (grade, difficulty, authorId, index) => {
  let content, ans, wrongs;
  const seed = index + 1;

  if (difficulty === 'easy') {
    if (seed % 3 === 0) {
      const a = seed * 2 + 10;
      const b = seed + 5;
      ans = a + b;
      content = `Tính: ${a} + ${b} = ?`;
      wrongs = [ans + 1, ans - 1, ans + 10];
    } else if (seed % 3 === 1) {
      const a = (seed % 10) + 2;
      const b = (seed % 9) + 2;
      ans = a * b;
      content = `Tính: ${a} x ${b} = ?`;
      wrongs = [ans + a, ans - b, ans + 1];
    } else {
      const a = seed + 10;
      content = `Số liền trước của số ${a} là số nào?`;
      ans = a - 1;
      wrongs = [a + 1, a + 2, a - 2];
    }
  } else if (difficulty === 'medium') {
    if (seed % 2 === 0) {
      const x = (seed % 10) + 2;
      const m = (seed % 5) + 2;
      const b = x * m + seed;
      content = `Tìm x biết: ${m}x = ${b} - ${seed}`;
      ans = x;
      wrongs = [x + 1, x - 1, m];
    } else {
      const r = (seed % 8) + 3;
      content = `Diện tích hình vuông có cạnh bằng ${r}m là?`;
      ans = r * r;
      wrongs = [r * 4, r * r + 2, (r+1)*(r+1)];
    }
  } else {
    if (seed % 2 === 0) {
      const a = (seed % 4) + 2;
      const b = seed;
      content = `Đạo hàm của hàm số y = x^${a} - ${b}x + 1 là?`;
      ans = `${a}x^${a - 1} - ${b}`;
      wrongs = [`${a}x^${a} - ${b}`, `x^${a - 1} + ${b}`, `${a}x - ${b}`];
    } else {
      const base = 2;
      const val = Math.pow(2, (seed % 4) + 2);
      content = `Giá trị của log2(${val}) là bao nhiêu?`;
      ans = (seed % 4) + 2;
      wrongs = [ans + 1, ans - 1, val];
    }
  }

  const { options, correctAnswer } = createOptions(String(ans), wrongs.map(String));

  return {
    subject: 'Toán', grade, difficulty,
    content, options, correctAnswer,
    explanation: `Kết quả đúng là ${ans}`,
    author: authorId
  };
};

const generateVanQuestion = (grade, difficulty, authorId, index) => {
  let content, ans, wrongs;
  const item = LITERATURE_DB[index % LITERATURE_DB.length];
  const others = LITERATURE_DB.filter(x => x.work !== item.work);

  if (difficulty === 'easy') {
    content = `Tác giả của tác phẩm "${item.work}" là ai?`;
    ans = item.author;
    wrongs = shuffleArray(others).slice(0, 3).map(o => o.author);
  } else if (difficulty === 'medium') {
    if (index % 2 === 0) {
      content = `Tác phẩm "${item.work}" thuộc thể loại nào?`;
      ans = item.type;
      const types = ['Thơ', 'Truyện ngắn', 'Tiểu thuyết', 'Kịch', 'Tùy bút', 'Cáo'].filter(t => t !== item.type);
      wrongs = shuffleArray(types).slice(0, 3);
    } else {
      content = `Đâu là một sáng tác của ${item.author}?`;
      ans = item.work;
      wrongs = shuffleArray(others).slice(0, 3).map(o => o.work);
    }
  } else {
    const concepts = [
      { q: 'Biện pháp tu từ nào dùng tên gọi sự vật này để chỉ sự vật khác dựa trên quan hệ tương cận?', a: 'Hoán dụ', w: ['Ẩn dụ', 'So sánh', 'Nhân hóa'] },
      { q: 'Trào lưu văn học nào đề cao cái tôi cá nhân và cảm xúc mãnh liệt?', a: 'Lãng mạn', w: ['Hiện thực', 'Cổ điển', 'Siêu thực'] },
      { q: 'Chi tiết "bát cháo hành" trong tác phẩm Chí Phèo mang ý nghĩa gì?', a: 'Tình người và sự hoàn lương', w: ['Sự đói khát', 'Sự trả thù', 'Sự giàu sang'] },
      { q: 'Nguyên lý "Tảng băng trôi" là phong cách nghệ thuật của ai?', a: 'Hemingway', w: ['Lỗ Tấn', 'Shakespear', 'Victor Hugo'] }
    ];
    const q = concepts[index % concepts.length];
    content = q.q;
    ans = q.a;
    wrongs = q.w;
  }

  const { options, correctAnswer } = createOptions(ans, wrongs);

  return {
    subject: 'Ngữ văn', grade, difficulty,
    content, options, correctAnswer,
    explanation: `Đáp án chính xác: ${ans}`,
    author: authorId
  };
};

const generateEngQuestion = (grade, difficulty, authorId, index) => {
  let content, ans, wrongs;
  const item = ENGLISH_DB[index % ENGLISH_DB.length];
  const others = ENGLISH_DB.filter(x => x.word !== item.word);

  if (difficulty === 'easy') {
    if (index % 2 === 0) {
      content = `What is the meaning of the word "${item.word}"?`;
      ans = item.mean;
      wrongs = shuffleArray(others).slice(0, 3).map(o => o.mean);
    } else {
      content = `Select a synonym for "${item.word}":`;
      ans = item.syn;
      wrongs = shuffleArray(others).slice(0, 3).map(o => o.syn);
    }
  } else if (difficulty === 'medium') {
    const grammars = [
      { q: 'She _____ to London last year.', a: 'went', w: ['go', 'goes', 'gone'] },
      { q: 'We _____ playing football now.', a: 'are', w: ['is', 'am', 'be'] },
      { q: 'He has _____ this book twice.', a: 'read', w: ['reads', 'reading', 'readed'] },
      { q: 'They enjoy _____ movies.', a: 'watching', w: ['watch', 'watched', 'to watch'] },
      { q: 'I am interested _____ learning English.', a: 'in', w: ['on', 'at', 'about'] },
      { q: 'The car is _____ than the bike.', a: 'faster', w: ['fast', 'fastest', 'more fast'] }
    ];
    const g = grammars[index % grammars.length];
    content = g.q;
    ans = g.a;
    wrongs = g.w;
  } else {
    const advanced = [
      { q: 'If I _____ a billionaire, I would travel the world.', a: 'were', w: ['am', 'was', 'been'] },
      { q: 'By the time she arrived, the train _____.', a: 'had left', w: ['left', 'has left', 'leaves'] },
      { q: 'Not only _____ beautiful but she is also intelligent.', a: 'is she', w: ['she is', 'she was', 'was she'] },
      { q: 'I wish I _____ known the truth earlier.', a: 'had', w: ['have', 'did', 'would'] }
    ];
    const a = advanced[index % advanced.length];
    content = a.q;
    ans = a.a;
    wrongs = a.w;
  }

  const { options, correctAnswer } = createOptions(ans, wrongs);

  return {
    subject: 'Tiếng Anh', grade, difficulty,
    content, options, correctAnswer,
    explanation: `Correct Answer: ${ans}`,
    author: authorId
  };
};

const seedData = async () => {
  try {
    await connectDB();

    await User.deleteMany({});
    await Question.deleteMany({});
    await Exam.deleteMany({});
    await Result.deleteMany({});
    
    //const salt = await bcrypt.genSalt(10);
    //const hashedPassword = await bcrypt.hash('123', salt);

    const adminUser = new User({
      username: 'Admin User',
      email: 'admin@test.com',
      role: 'admin',
      password: '123'
    });
    await adminUser.save();

    const teacherUser = new User({
      username: 'Demo Teacher',
      email: 'teacher@test.com',
      role: 'teacher',
      password: '123'
    });
    await teacherUser.save();

    const now = new Date();
    const sampleQuestions = [
      { questionText: '10 + 10 = ?', options: ['20','30','40','50'], correctOption: 0 },
      { questionText: '20 + 20 = ?', options: ['30','40','50','60'], correctOption: 1 },
      { questionText: '5 x 5 = ?', options: ['10','15','20','25'], correctOption: 3 }
    ];

    const allGenerated = [];
    const grades = ['11', '12'];
    const subjects = ['Toán', 'Ngữ văn', 'Tiếng Anh'];
    const difficulties = ['easy', 'medium', 'hard'];
    const counts = { easy: 20, medium: 20, hard: 10 };

    let globalIndex = 0;

    for (const grade of grades) {
      for (const subject of subjects) {
        for (const diff of difficulties) {
          const count = counts[diff];
          for (let i = 0; i < count; i++) {
            globalIndex++; 
            if (subject === 'Toán') {
              allGenerated.push(generateMathQuestion(grade, diff, teacherUser._id, globalIndex));
            } else if (subject === 'Ngữ văn') {
              allGenerated.push(generateVanQuestion(grade, diff, teacherUser._id, globalIndex));
            } else {
              allGenerated.push(generateEngQuestion(grade, diff, teacherUser._id, globalIndex));
            }
          }
        }
      }
    }

    if (allGenerated.length) {
      await Question.insertMany(allGenerated);
    }

    const upcomingExam = new Exam({
      title: 'Kiểm tra Sắp tới',
      description: 'Bài thi thử nghiệm trạng thái Upcoming',
      subject: 'Toán',
      grade: '11',
      durationMinutes: 30,
      startTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      questions: sampleQuestions,
      creator: teacherUser._id
    });

    const ongoingExam = new Exam({
      title: 'Kiểm tra Đang diễn ra',
      description: 'Bài thi thử nghiệm trạng thái Ongoing',
      subject: 'Vật Lý',
      grade: '12',
      durationMinutes: 60,
      startTime: new Date(now.getTime() - 30 * 60 * 1000),
      endTime: new Date(now.getTime() + 30 * 60 * 1000),
      questions: sampleQuestions,
      creator: teacherUser._id
    });

    const finishedExam = new Exam({
      title: 'Kiểm tra Đã kết thúc',
      description: 'Bài thi thử nghiệm trạng thái Finished',
      subject: 'Hóa Học',
      grade: '12',
      durationMinutes: 45,
      startTime: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      questions: sampleQuestions,
      creator: teacherUser._id
    });

    await upcomingExam.save();
    await ongoingExam.save();
    await finishedExam.save();

    const studentUser = new User({
      username: 'Demo Student',
      email: 'student@test.com',
      role: 'student',
      password: '123'
    });
    await studentUser.save();

    const sampleResult = new Result({
      student: studentUser._id,
      exam: finishedExam._id,
      answers: finishedExam.questions.map((q) => ({
        questionText: q.questionText,
        selectedOption: q.correctOption,
        correctOption: q.correctOption,
        isCorrect: true
      })),
      score: 10,
      totalQuestions: finishedExam.questions.length,
      correctCount: finishedExam.questions.length,
      completedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 1000)
    });
    await sampleResult.save();

    console.log('Seed completed successfully');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();