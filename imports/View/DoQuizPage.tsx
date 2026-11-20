// imports/ui/Components/DoQuizPage.tsx
import React, { useState, useEffect } from 'react';
import { api } from '../api/routeQuiz';

interface Question {
  id: number;
  content: string;
  type: string;
  data: any; // { options: [], correctIndex: number }
}

interface DoQuizProps {
  quizId: number;
  attemptId: number;
  onExit: () => void;
}

export const DoQuizPage: React.FC<DoQuizProps> = ({ quizId, attemptId, onExit }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, any>>({}); // Map: QuestionID -> Answer
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{score: number, total: number} | null>(null);

  useEffect(() => {
    loadQuestions();
  }, [quizId]);

  const loadQuestions = async () => {
    try {
      const res = await api.getQuestions(quizId);
      if (res.questions) setQuestions(res.questions);
    } catch (e) {
      console.error("Error loading questions", e);
    }
  };

  const handleSelectOption = (qId: number, index: number) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: { index: index } // Format expected by backend
    }));
  };

  const handleSubmit = async () => {
    if (!window.confirm("Bạn có chắc muốn nộp bài?")) return;
    
    setIsSubmitting(true);
    try {
      // Convert map to array for backend
      const answerList = Object.keys(answers).map(qId => ({
        questionId: parseInt(qId),
        answerData: answers[parseInt(qId)]
      }));

      const res = await api.submitAttempt(attemptId, answerList);
      
      if (res.score !== undefined) {
        setResult({ score: res.score, total: res.total });
      }
    } catch (e) {
      alert("Lỗi khi nộp bài!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RESULT VIEW ---
  if (result) {
    return (
      <div className="do-quiz-container" style={{textAlign: 'center', padding: 50}}>
        <h1>🎉 Hoàn thành!</h1>
        <div style={{fontSize: '3rem', margin: '20px 0', color: '#6c5ce7', fontWeight: 'bold'}}>
          {result.score} / {result.total}
        </div>
        <p>Bạn đã trả lời đúng {result.score} câu hỏi.</p>
        <button className="btn-primary" onClick={onExit}>Trở về trang chủ</button>
      </div>
    );
  }

  // --- LOADING VIEW ---
  if (questions.length === 0) return <div style={{padding:20}}>⏳ Đang tải đề thi...</div>;

  const activeQ = questions[currentIdx];
  const totalQ = questions.length;
  const isSelected = (idx: number) => answers[activeQ.id]?.index === idx;

  return (
    <div className="do-quiz-container" style={{maxWidth: 800, margin: '0 auto', padding: 20}}>
      {/* HEADER */}
      <header style={{display: 'flex', justifyContent: 'space-between', marginBottom: 20, borderBottom: '1px solid #ddd', paddingBottom: 10}}>
        <div>
          <h3>Đang làm bài thi</h3>
          <small>Câu hỏi {currentIdx + 1}/{totalQ}</small>
        </div>
        <div>
          <button className="btn-secondary" onClick={onExit}>Thoát</button>
        </div>
      </header>

      {/* QUESTION CARD */}
      <div className="quiz-card" style={{background: 'white', padding: 30, borderRadius: 10, boxShadow: '0 4px 10px rgba(0,0,0,0.1)'}}>
        <h2 style={{marginTop:0}}>{activeQ.content}</h2>

        {/* OPTIONS (Multiple Choice) */}
        {activeQ.type === 'multiple' && (
          <div className="options-list" style={{display: 'grid', gap: 15, marginTop: 20}}>
            {activeQ.data.options.map((opt: string, idx: number) => (
              <div 
                key={idx} 
                onClick={() => handleSelectOption(activeQ.id, idx)}
                style={{
                  padding: 15, 
                  border: isSelected(idx) ? '2px solid #6c5ce7' : '1px solid #ddd',
                  borderRadius: 8,
                  background: isSelected(idx) ? '#f0f0ff' : 'white',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center'
                }}
              >
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', 
                  border: isSelected(idx) ? '6px solid #6c5ce7' : '2px solid #ccc',
                  marginRight: 15
                }}></div>
                <span style={{fontSize: '1.1rem'}}>{opt}</span>
              </div>
            ))}
          </div>
        )}

        {/* NAVIGATION */}
        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 40}}>
          <button 
            className="btn-secondary"
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx(currentIdx - 1)}
          >
            ⬅ Câu trước
          </button>

          {currentIdx === totalQ - 1 ? (
            <button 
              className="btn-primary"
              style={{background: '#00b894'}}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              ✅ Nộp bài
            </button>
          ) : (
            <button 
              className="btn-primary"
              onClick={() => setCurrentIdx(currentIdx + 1)}
            >
              Câu tiếp ➡
            </button>
          )}
        </div>
      </div>
      
      {/* Progress Bar */}
      <div style={{marginTop: 20, height: 6, background: '#eee', borderRadius: 3}}>
         <div style={{
             height: '100%', 
             width: `${((currentIdx + 1) / totalQ) * 100}%`, 
             background: '#6c5ce7', 
             borderRadius: 3,
             transition: 'width 0.3s'
         }}></div>
      </div>
    </div>
  );
};