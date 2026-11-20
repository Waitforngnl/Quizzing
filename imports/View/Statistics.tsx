// imports/ui/Components/Statistics.tsx
import React, { useState, useEffect } from 'react';
import { api } from '../api/routeQuiz';

interface StatsData {
  overview: {
    total_attempts: number;
    avg_score: number;
    highest_score: number;
    pass_rate: number;
  };
  leaderboard: Array<{
    username: string;
    score: number;
    completed_at: string;
  }>;
  questionStats: Array<{
    question_id: number;
    content: string;
    correct_count: number;
    incorrect_count: number;
    total_answers: number;
  }>;
  attempts: Array<{
    attempt_id: number;
    username: string;
    score: number;
    started_at: string;
    status: string;
  }>;
}

interface Props {
    quizId: number | null; // Allow null to show list
    onBack: () => void;    // Function to go back to Dashboard
}

export const StatisticsView: React.FC<Props> = ({ quizId, onBack }) => {
  // Local state to manage which quiz is selected internally
  const [currentQuizId, setCurrentQuizId] = useState<number | null>(quizId);
  const [quizList, setQuizList] = useState<any[]>([]); // List of user's quizzes
  
  const [activeSubTab, setActiveSubTab] = useState('Tổng quan');
  const [data, setData] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Sync prop to state (in case we do come from PersonalInfo)
  useEffect(() => {
      setCurrentQuizId(quizId);
  }, [quizId]);

  // 2. Fetch Quiz List if no quiz is selected
  useEffect(() => {
      if (currentQuizId === null) {
          loadQuizList();
          setData(null); // Clear old data
      } else {
          loadStats(currentQuizId);
      }
  }, [currentQuizId]);

  const loadQuizList = async () => {
      try {
          const res = await api.getMyQuizzes();
          if (res.quizzes) setQuizList(res.quizzes);
      } catch (error) {
          console.error("Error loading quiz list", error);
      }
  };

  const loadStats = async (id: number) => {
    setIsLoading(true);
    try {
        const res = await api.getQuizStats(id);
        // Only set data if valid response
        if(res.overview || res.leaderboard) { 
            setData(res);
        }
    } catch (error) {
        console.error("Failed to load stats", error);
    } finally {
        setIsLoading(false);
    }
  };

  // --- MODE 1: SELECT QUIZ (LIST VIEW) ---
  if (currentQuizId === null) {
      return (
          <div className="stats-container" style={{padding: '20px 40px'}}>
              <div style={{display:'flex', alignItems:'center', marginBottom: 20}}>
                  <h2 style={{margin:0}}>📊 Chọn Quiz để xem báo cáo</h2>
              </div>
              
              {quizList.length === 0 ? (
                  <p>Bạn chưa có Quiz nào.</p>
              ) : (
                  <div className="quiz-list-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                      {quizList.map(q => (
                          <div 
                            key={q.id} 
                            className="tool-card"
                            style={{
                                borderLeft: '4px solid #0984e3', 
                                padding: 20, 
                                cursor: 'pointer', 
                                background: 'white',
                                borderRadius: 8,
                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                                transition: 'transform 0.2s'
                            }}
                            onClick={() => setCurrentQuizId(q.id)} // Select this quiz
                          >
                              <h3 style={{marginTop:0}}>{q.name}</h3>
                              <p style={{color:'#666', fontSize:'0.9rem'}}>Trạng thái: {q.status}</p>
                              <div style={{textAlign:'right', marginTop:15}}>
                                  <span style={{color:'#0984e3', fontWeight:'bold'}}>Xem chi tiết ➡</span>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      );
  }

  // --- MODE 2: VIEW STATS (REPORT VIEW) ---
  
  if (isLoading) return <div style={{padding: 40, textAlign:'center'}}>⏳ Đang phân tích dữ liệu...</div>;
  
  // Handle empty data or error
  if (!data) {
      return (
          <div style={{padding: 40, textAlign:'center'}}>
              <h3>❌ Chưa có dữ liệu thống kê</h3>
              <p>Quiz này có thể chưa có ai làm bài.</p>
              <button className="btn-secondary" onClick={() => setCurrentQuizId(null)}>⬅ Chọn Quiz khác</button>
          </div>
      );
  }

  const renderSubContent = () => {
    switch (activeSubTab) {
      case 'Tổng quan':
        return (
          <>
            <div className="stats-summary-grid">
              <div className="stat-card">
                <p>Tổng lượt làm</p>
                <h3>👤 {data.overview?.total_attempts || 0}</h3>
              </div>
              <div className="stat-card">
                <p>Điểm trung bình</p>
                <h3>{data.overview?.avg_score || 0}</h3>
              </div>
              <div className="stat-card">
                <p>Cao nhất</p>
                <h3>🏆 {data.overview?.highest_score || 0}</h3>
              </div>
              <div className="stat-card">
                <p>Tỉ lệ đạt</p>
                <h3>{data.overview?.pass_rate || 0}%</h3>
              </div>
            </div>
          </>
        );
      case 'Theo câu hỏi':
        return (
            <div className="stats-table-wrapper">
                <h3>Phân tích câu hỏi</h3>
                <table className="stats-table">
                    <thead>
                        <tr>
                            <th style={{width:'50%'}}>Nội dung</th>
                            <th>Đúng</th>
                            <th>Sai</th>
                            <th>Tỉ lệ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.questionStats?.map((q) => {
                            const rate = q.total_answers > 0 ? Math.round((q.correct_count / q.total_answers) * 100) : 0;
                            return (
                                <tr key={q.question_id}>
                                    <td>{q.content}</td>
                                    <td style={{color:'green'}}>{q.correct_count}</td>
                                    <td style={{color:'red'}}>{q.incorrect_count}</td>
                                    <td>{rate}%</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
      case 'Theo người làm':
        return (
            <div className="stats-table-wrapper">
                <h3>Lịch sử người làm</h3>
                <table className="stats-table">
                    <thead>
                        <tr>
                            <th>Tên</th>
                            <th>Điểm</th>
                            <th>Thời gian</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.attempts?.map((att) => (
                            <tr key={att.attempt_id}>
                                <td>{att.username}</td>
                                <td><strong>{att.score}</strong></td>
                                <td>{new Date(att.started_at).toLocaleString()}</td>
                                <td>{att.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
      case 'Xếp hạng':
        return (
            <div className="stats-table-wrapper">
              <h3>🏆 Bảng xếp hạng</h3>
              <table className="stats-table">
                <thead><tr><th>Hạng</th><th>Tên</th><th>Điểm</th></tr></thead>
                <tbody>
                  {data.leaderboard.map((u, i) => (
                    <tr key={i}><td>{i+1}</td><td>{u.username}</td><td>{u.score}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
        );
      default: return <div>...</div>;
    }
  };

  return (
    <div className="stats-container">
      {/* Header for Stats View */}
      <div className="stats-banner" style={{display:'flex', justifyContent:'space-between', padding: '15px 20px', alignItems:'center'}}>
        <h2 style={{margin:0}}>📊 Báo cáo chi tiết</h2>
        <div>
            {/* BUTTON TO GO BACK TO LIST */}
            <button 
                onClick={() => setCurrentQuizId(null)} 
                className="btn-secondary" 
                style={{marginRight: 10, background: '#fff', border: '1px solid #ccc'}}
            >
                🔄 Chọn Quiz khác
            </button>
            
            {/* BUTTON TO EXIT STATS TAB */}
            <button onClick={onBack} className="btn-secondary">Thoát</button>
        </div>
      </div>

      <div className="stats-content-layout">
        <aside className="stats-sub-sidebar">
          <div className="sub-menu">
            {['Tổng quan', 'Theo người làm', 'Theo câu hỏi', 'Xếp hạng'].map(tab => (
                <button 
                    key={tab} 
                    className={`sub-btn ${activeSubTab === tab ? 'active' : ''}`} 
                    onClick={() => setActiveSubTab(tab)}
                >
                    {tab}
                </button>
            ))}
          </div>
        </aside>
        <div className="stats-main-data">{renderSubContent()}</div>
      </div>
    </div>
  );
};