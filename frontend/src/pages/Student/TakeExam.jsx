import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './TakeExam.css';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

function TakeExam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [displayQuestions, setDisplayQuestions] = useState([]);
  
  const [cheatWarnings, setCheatWarnings] = useState(0);
  const [showCheatModal, setShowCheatModal] = useState(false); 
  const [isSubmitting, setIsSubmitting] = useState(false); 

  // TÍNH NĂNG MỚI: Khóa lưu trữ cho bài thi này
  const draftKey = `draft_exam_${id}`;

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setCheatWarnings(prev => prev + 1);
        setShowCheatModal(true); 
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // KHỞI TẠO BÀI THI HOẶC PHỤC HỒI TỪ BẢN LƯU NHÁP
  useEffect(() => {
    fetch(`http://localhost:5001/api/exams`)
      .then(res => res.json())
      .then(data => {
        const found = data.find(ex => ex._id === id);
        if (found) {
          setExam(found);
          
          // Kiểm tra xem có bản lưu nháp nào không (Học sinh bị rớt mạng/F5)
          const savedDraft = localStorage.getItem(draftKey);
          
          if (savedDraft) {
            // PHỤC HỒI DỮ LIỆU
            const draft = JSON.parse(savedDraft);
            setAnswers(draft.answers);
            setTimeLeft(draft.timeLeft);
            setDisplayQuestions(draft.displayQuestions);
            setCheatWarnings(draft.cheatWarnings || 0);
          } else {
            // TẠO MỚI HOÀN TOÀN
            const validMinutes = (found.durationMinutes && found.durationMinutes > 0) ? found.durationMinutes : 45;
            setTimeLeft(validMinutes * 60);

            let preparedQs = found.questions.map((q, qIdx) => ({
              ...q,
              originalQIdx: qIdx, 
              displayOptions: q.options.map((optText, oIdx) => ({
                text: optText,
                originalOIdx: oIdx 
              }))
            }));

            if (found.randomizeQuestions) {
              preparedQs = shuffleArray(preparedQs);
              preparedQs = preparedQs.map(q => ({
                ...q,
                displayOptions: shuffleArray(q.displayOptions)
              }));
            }
            setDisplayQuestions(preparedQs);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id, draftKey]);

  // TÍNH NĂNG MỚI: AUTO-SAVE NGẦM MỖI KHI CÓ THAY ĐỔI
  useEffect(() => {
    if (!loading && displayQuestions.length > 0 && timeLeft > 0 && !isSubmitting) {
      const draftData = {
        answers,
        timeLeft,
        displayQuestions,
        cheatWarnings
      };
      localStorage.setItem(draftKey, JSON.stringify(draftData));
    }
  }, [answers, timeLeft, displayQuestions, cheatWarnings, loading, isSubmitting, draftKey]);

  // BỘ ĐẾM THỜI GIAN
  useEffect(() => {
    if (!loading && timeLeft > 0 && !showCheatModal) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft <= 0 && !loading && exam && !isSubmitting) {
      handleFinish();
    }
    // eslint-disable-next-line
  }, [timeLeft, loading, exam, showCheatModal, isSubmitting]);

  const handleFinish = async () => {
    setIsSubmitting(true); 
    
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      alert("Hết phiên làm việc, vui lòng đăng nhập lại");
      return;
    }
    const user = JSON.parse(storedUser);

    const payload = {
      examId: id,
      studentId: user.id || user._id,
      studentAnswers: answers 
    };

    try {
      const res = await fetch('http://localhost:5001/api/results/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        // Nộp bài thành công thì xóa luôn bản nháp
        localStorage.removeItem(draftKey);
        
        alert(`Nộp bài thành công!\nĐiểm của bạn: ${data.score}\nSố lần cảnh báo gian lận: ${cheatWarnings}`);
        navigate('/student/join');
      } else {
        alert(data.message || "Lỗi khi nộp bài");
        setIsSubmitting(false); 
      }
    } catch (err) {
      alert("Không thể kết nối đến máy chủ");
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="take-exam-loading">Đang tải đề thi...</div>;
  if (!exam) return <div className="take-exam-error">Không tìm thấy đề thi</div>;

  return (
    <div className="take-exam-page">
      {showCheatModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', textAlign: 'center', maxWidth: '400px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
            <h2 style={{ color: '#d63031', marginTop: 0, fontSize: '24px' }}>⚠️ CẢNH BÁO GIAN LẬN</h2>
            <p style={{ fontSize: '16px', color: '#2d3436' }}>Bạn vừa rời khỏi trang thi! Hệ thống đã ghi nhận hành động này.</p>
            <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#d63031' }}>Lần vi phạm: {cheatWarnings}</p>
            <button 
              onClick={() => {
                setShowCheatModal(false);
                // Ép lưu bản nháp ngay khi tắt modal để update số lần gian lận
                localStorage.setItem(draftKey, JSON.stringify({ answers, timeLeft, displayQuestions, cheatWarnings }));
              }}
              style={{ backgroundColor: '#0984e3', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', marginTop: '15px', fontSize: '16px' }}
            >
              Tôi đã hiểu và cam kết không tái phạm
            </button>
          </div>
        </div>
      )}

      <div className="exam-sidebar">
        {cheatWarnings > 0 && (
          <div style={{ backgroundColor: '#ffcccc', color: '#d63031', padding: '10px', borderRadius: '5px', marginBottom: '15px', fontWeight: 'bold', border: '1px solid #d63031', textAlign: 'center' }}>
            ⚠️ Vi phạm: {cheatWarnings} lần
          </div>
        )}

        <div className="timer-box">
          <span>Thời gian còn lại</span>
          <div className={`time-display ${timeLeft < 60 ? 'warning' : ''}`}>
            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
          </div>
          <div className="time-info">
             {exam.durationMinutes || 45} phút
          </div>
        </div>
        
        <div className="question-nav">
          <div className="nav-grid">
            {displayQuestions.map((q, displayIdx) => (
              <div key={displayIdx} className={`nav-item ${answers[q.originalQIdx] !== undefined ? 'answered' : ''}`}>
                {displayIdx + 1}
              </div>
            ))}
          </div>
        </div>
        
        <button className="btn-submit-exam" onClick={handleFinish} disabled={isSubmitting}>
          {isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
        </button>
      </div>

      <div className="exam-main">
        <h2>{exam.title}</h2>
        <div className="questions-container">
          {displayQuestions.map((q, displayIdx) => (
            <div key={displayIdx} className="question-card">
              <div style={{ fontSize: '16px', marginBottom: '15px' }}>
                <strong>Câu {displayIdx + 1}: </strong> 
                <Latex>{q.questionText}</Latex>
              </div>
              
              <div className="options-list">
                {q.displayOptions.map((opt, oDisplayIdx) => (
                  <label key={oDisplayIdx} className={`option-item ${answers[q.originalQIdx] === opt.originalOIdx ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name={`q-${q.originalQIdx}`} 
                      onChange={() => setAnswers({...answers, [q.originalQIdx]: opt.originalOIdx})}
                      checked={answers[q.originalQIdx] === opt.originalOIdx} 
                    />
                    <span style={{ marginLeft: '10px' }}>
                      {String.fromCharCode(65 + oDisplayIdx)}. <Latex>{opt.text}</Latex>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TakeExam;