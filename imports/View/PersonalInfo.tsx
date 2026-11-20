// imports/ui/PersonalInfo.tsx
import React, { useState, useEffect } from 'react';
import { api } from '../api/routeQuiz';
import { QuizEditor } from './EditQuizPage'; 

interface Quiz {
  id: number;
  name: string;
  status: string;
  startedAt: string;
}

// Add prop interface
interface PersonalInfoProps {
    onViewStats: (quizId: number) => void;
}

export const PersonalInfo: React.FC<PersonalInfoProps> = ({ onViewStats }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentQuizId, setCurrentQuizId] = useState<number | null>(null);
  const [currentQuizTitle, setCurrentQuizTitle] = useState("");
  const [myQuizzes, setMyQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    if (!isEditing) {
        loadQuizzes();
    }
  }, [isEditing]);

  const loadQuizzes = async () => {
    try {
      const res = await api.getMyQuizzes();
      if (res.quizzes) setMyQuizzes(res.quizzes);
    } catch (error) {
      console.error("Error loading quizzes", error);
    }
  };

  const handleCreateNew = async () => {
    try {
      const res = await api.createQuiz("Bản nháp mới");
      if (res && res.quiz) {
        setCurrentQuizId(res.quiz.id);
        setCurrentQuizTitle(res.quiz.name);
        setIsEditing(true);
      }
    } catch (error) {
      alert("Lỗi khi tạo Quiz.");
    }
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setCurrentQuizId(quiz.id);
    setCurrentQuizTitle(quiz.name);
    setIsEditing(true);
  };

  const handleDeleteQuiz = async (quizId: number, e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (!window.confirm("Bạn có chắc muốn xóa Quiz này không?")) return;
    try {
      await api.deleteQuiz(quizId);
      setMyQuizzes(myQuizzes.filter(q => q.id !== quizId));
    } catch (error) {
      alert("Lỗi khi xóa Quiz");
    }
  };

  if (isEditing && currentQuizId !== null) {
    return (
        <QuizEditor 
            quizId={currentQuizId} 
            initialTitle={currentQuizTitle}
            onExit={() => setIsEditing(false)} 
        />
    );
  }

  return (
    <div className="personal-info-container">
      <section className="section-block">
        <div className="section-header">
          <h3>OnQuiz của bạn</h3>
          <button className="btn-primary" onClick={handleCreateNew}>+ Tạo mới</button>
        </div>
        
        {myQuizzes.length === 0 ? (
          <div className="empty-placeholder">Bạn chưa có Quiz nào.</div>
        ) : (
          <div className="quiz-list-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {myQuizzes.map((quiz) => (
            <div 
              key={quiz.id} 
              className="tool-card"
              style={{ borderLeft: '4px solid #6c5ce7', position: 'relative', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
            >
               {/* 1. EDIT Click (Main Card) */}
               <div style={{cursor: 'pointer'}} onClick={() => handleEditQuiz(quiz)}>
                    <h4 style={{margin: '0 0 10px 0'}}>{quiz.name}</h4>
                    <p style={{margin: '0', fontSize: '0.9rem', color: '#666'}}>
                        Trạng thái: <strong style={{color: quiz.status === 'published' ? 'green' : '#999'}}>{quiz.status}</strong>
                    </p>
               </div>

               {/* 2. ACTION BUTTONS */}
               <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 15, gap: 10}}>
                    {/* STATS BUTTON */}
                    <button 
                        onClick={(e) => { e.stopPropagation(); onViewStats(quiz.id); }}
                        style={{background: '#e3f2fd', color: '#0984e3', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem'}}
                        title="Xem thống kê"
                    >
                        📊 Thống kê
                    </button>

                    {/* DELETE BUTTON (Draft only) */}
                    {quiz.status === 'draft' && (
                        <button 
                            onClick={(e) => handleDeleteQuiz(quiz.id, e)}
                            style={{background: '#ffeaa7', color: '#d63031', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem'}}
                            title="Xóa"
                        >
                            🗑️
                        </button>
                    )}
               </div>
            </div>
          ))}
          </div>
        )}
      </section>
    </div>
  );
};