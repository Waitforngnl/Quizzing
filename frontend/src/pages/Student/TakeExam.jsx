import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './TakeExam.css';

// TÍNH NĂNG MỚI: Import thư viện và CSS của LaTeX
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

function TakeExam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [cheatWarnings, setCheatWarnings] = useState(0);
  const [showCheatModal, setShowCheatModal] = useState(false); 
  const [isSubmitting, setIsSubmitting] = useState(false); 

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

  useEffect(() => {
    fetch(`http://localhost:5001/api/exams`)
      .then(res => res.json())
      .then(data => {
        const found = data.find(ex => ex._id === id);
        if (found) {
          setExam(found);
          const validMinutes = (found.durationMinutes && found.durationMinutes > 0) ? found.durationMinutes : 45;
          setTimeLeft(validMinutes * 60);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

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
              onClick={() => setShowCheatModal(false)}
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
            {exam.questions.map((_, idx) => (
              <div key={idx} className={`nav-item ${answers[idx] !== undefined ? 'answered' : ''}`}>
                {idx + 1}
              </div>
            ))}
          </div>
        </div>
        
        <button 
          className="btn-submit-exam" 
          onClick={handleFinish}
          disabled={isSubmitting} 
        >
          {isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
        </button>
      </div>

      <div className="exam-main">
        <h2>{exam.title}</h2>
        <div className="questions-container">
          {exam.questions.map((q, qIdx) => (
            <div key={qIdx} className="question-card">
              {/* TÍNH NĂNG MỚI: Bọc nội dung câu hỏi trong thẻ Latex */}
              <div style={{ fontSize: '16px', marginBottom: '15px' }}>
                <strong>Câu {qIdx + 1}: </strong> 
                <Latex>{q.questionText}</Latex>
              </div>
              
              <div className="options-list">
                {q.options.map((opt, oIdx) => (
                  <label key={oIdx} className={`option-item ${answers[qIdx] === oIdx ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name={`q-${qIdx}`} 
                      onChange={() => setAnswers({...answers, [qIdx]: oIdx})}
                      checked={answers[qIdx] === oIdx} 
                    />
                    {/* TÍNH NĂNG MỚI: Bọc nội dung đáp án trong thẻ Latex */}
                    <span style={{ marginLeft: '10px' }}>
                      {String.fromCharCode(65 + oIdx)}. <Latex>{opt}</Latex>
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