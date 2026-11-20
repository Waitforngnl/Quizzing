import React, { useState, useEffect } from 'react';
import { api } from '../api/routeQuiz';

interface Question {
  id: number;
  content: string;
  type: string;
  data: any; 
}

interface QuizEditorProps {
  quizId: number;
  initialTitle: string;
  onExit: () => void;
}

export const QuizEditor: React.FC<QuizEditorProps> = ({ quizId, initialTitle, onExit }) => {
  const [title, setTitle] = useState(initialTitle);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [statusMsg, setStatusMsg] = useState("Sẵn sàng");
  
  // Settings State
  const [accessCode, setAccessCode] = useState<string>('');
  const [quizStatus, setQuizStatus] = useState<string>('draft');
  const [startedAt, setStartedAt] = useState<string>('');
  const [endedAt, setEndedAt] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadData();
  }, [quizId]);

  const loadData = async () => {
    try {
      const qRes = await api.getQuestions(quizId);
      if (qRes.questions) setQuestions(qRes.questions);
      
      const dRes = await api.getQuizDetail(quizId);
      if (dRes.quiz) {
          const q = dRes.quiz;
          setQuizStatus(q.status);
          setTitle(q.name);
          // 2. LẤY ACCESS CODE TỪ API
          if (q.accessCode) setAccessCode(q.accessCode);

          if(q.startedAt) setStartedAt(new Date(q.startedAt).toISOString().slice(0, 16));
          if(q.endedAt) setEndedAt(new Date(q.endedAt).toISOString().slice(0, 16));
      }
    } catch (err) {
      console.error("Load failed", err);
    }
  };

  // --- ACTIONS ---

  const handleSaveSettings = async () => {
      setStatusMsg("Lưu cài đặt...");
      try {
          await api.updateQuiz(quizId, {
              name: title,
              status: quizStatus,
              startedAt: startedAt || null,
              endedAt: endedAt || null
          });
          setStatusMsg("Đã lưu cài đặt!");
          setShowSettings(false);
      } catch (e) {
          setStatusMsg("Lỗi lưu cài đặt");
      }
  };

  const handleAddQuestion = async () => {
    // Default to 'multiple'
    const res = await api.addQuestion(quizId, "Câu hỏi mới...", "multiple", 
        { options: ["A", "B", "C", "D"], correctIndex: 0 }
    );
    if (res.question) {
        const newArr = [...questions, res.question];
        setQuestions(newArr);
        setCurrentQIndex(newArr.length - 1);
    }
  };

  const handleUpdateCurrentQuestion = async () => {
    const q = questions[currentQIndex];
    setStatusMsg("Đang lưu câu hỏi...");
    // Pass 'type' to update
    await api.updateQuestion(quizId, q.id, q.content, q.type, q.data);
    setStatusMsg("Đã lưu câu hỏi!");
  };

  // Helper for Local State
  const updateLocal = (field: string, val: any, idx?: number) => {
    const newQs = [...questions];
    const q = { ...newQs[currentQIndex] };
    
    if(field === 'content') q.content = val;
    if(field === 'type') q.type = val; // Handle Type Change
    if(field === 'correct') q.data = { ...q.data, correctIndex: val };
    if(field === 'opt' && idx !== undefined) {
        const opts = [...q.data.options];
        opts[idx] = val;
        q.data = { ...q.data, options: opts };
    }
    
    newQs[currentQIndex] = q;
    setQuestions(newQs);
  };

  const activeQ = questions[currentQIndex];

  return (
    <div className="onquiz-editor-wrapper">
      
      {/* HEADER */}
      <header className="oq-header">
        <div style={{display:'flex', alignItems:'center'}}>
            <button className="btn btn-secondary" onClick={onExit} style={{marginRight: 15}}>⬅</button>
            <input 
                className="oq-title-input"
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => api.updateQuiz(quizId, {name: title})}
            />
            <span className={`oq-badge ${quizStatus === 'published' ? 'published' : 'draft'}`}>
                {quizStatus === 'published' ? '🟢 Public' : '⚪ Draft'}
            </span>

            {/* 3. HIỂN THỊ ACCESS CODE NẾU KHÔNG PHẢI DRAFT */}
            {quizStatus !== 'draft' && accessCode && (
                <div style={{
                    marginLeft: 15, 
                    padding: '4px 10px', 
                    background: '#e3f2fd', 
                    color: '#0d47a1', 
                    borderRadius: '4px',
                    border: '1px dashed #2196f3',
                    fontWeight: 'bold',
                    fontSize: '0.9rem'
                }}>
                    🔑 Code: {accessCode}
                </div>
            )}
        </div>
        
        <div style={{color: '#888'}}>{statusMsg}</div>

        <div className="oq-header-actions">
            <button className="btn btn-secondary" onClick={() => setShowSettings(!showSettings)}>
                ⚙️ Cài đặt
            </button>
        </div>
      </header>

      {/* SETTINGS PANEL */}
      {showSettings && (
          <div className="oq-settings-panel" style={{padding: '20px', background: '#f8f9fa', borderBottom: '1px solid #ddd'}}>
              <h3>Cài đặt Quiz</h3>
              <div style={{display:'flex', gap:'20px', alignItems:'flex-end'}}>
                  <div>
                      <label style={{display:'block'}}>Trạng thái:</label>
                      <select value={quizStatus} onChange={(e) => setQuizStatus(e.target.value)} style={{padding: 8}}>
                          <option value="draft">Bản nháp (Draft)</option>
                          <option value="published">Công khai (Published)</option>
                          <option value="hidden">Ẩn (Hidden)</option>
                      </select>
                  </div>
                  <div>
                      <label style={{display:'block'}}>Bắt đầu:</label>
                      <input type="datetime-local" value={startedAt} onChange={(e) => setStartedAt(e.target.value)} />
                  </div>
                  <div>
                      <label style={{display:'block'}}>Kết thúc:</label>
                      <input type="datetime-local" value={endedAt} onChange={(e) => setEndedAt(e.target.value)} />
                  </div>
                  <button className="btn btn-primary" onClick={handleSaveSettings}>Lưu cài đặt</button>
              </div>
          </div>
      )}

      {/* BODY */}
      <div className="oq-body">
        
        {/* SIDEBAR */}
        <aside className="oq-sidebar">
            {questions.map((q, idx) => (
                <div 
                    key={q.id} 
                    className={`oq-q-card ${idx === currentQIndex ? 'active' : ''}`}
                    onClick={() => setCurrentQIndex(idx)}
                >
                    <span className="oq-q-num">#{idx + 1} ({q.type})</span>
                    <div className="oq-q-text">{q.content}</div>
                </div>
            ))}
            <button className="oq-btn-add" onClick={handleAddQuestion}>+ Thêm câu hỏi</button>
        </aside>

        {/* MAIN EDITOR */}
        <main className="oq-canvas">
            {activeQ ? (
                <div className="oq-paper">
                    
                    {/* TYPE SELECTOR */}
                    <div style={{marginBottom: 15, textAlign:'right'}}>
                        <label>Loại câu hỏi: </label>
                        <select 
                            value={activeQ.type} 
                            onChange={(e) => updateLocal('type', e.target.value)}
                            style={{padding: 5}}
                        >
                            <option value="multiple">Trắc nghiệm</option>
                            <option value="true_false">Đúng / Sai</option>
                            <option value="essay">Tự luận</option>
                        </select>
                    </div>

                    <div className="oq-input-area">
                        <textarea 
                            value={activeQ.content} 
                            onChange={(e) => updateLocal('content', e.target.value)}
                            placeholder="Nhập câu hỏi..."
                        />
                    </div>

                    {/* RENDER OPTIONS BASED ON TYPE */}
                    {activeQ.type === 'multiple' && (
                        <div className="oq-options-grid">
                            {(activeQ.data?.options || []).map((opt: string, i: number) => (
                                <div key={i} className={`oq-option-item ${activeQ.data.correctIndex === i ? 'correct' : ''}`}>
                                    <input 
                                        type="radio" 
                                        name="correctIdx" 
                                        className="oq-radio"
                                        checked={activeQ.data.correctIndex === i}
                                        onChange={() => updateLocal('correct', i)}
                                    />
                                    <input 
                                        type="text" 
                                        className="oq-input-opt" 
                                        value={opt}
                                        onChange={(e) => updateLocal('opt', e.target.value, i)}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {activeQ.type === 'essay' && (
                        <div style={{padding: 20, background: '#eee', color:'#555'}}>
                            Người dùng sẽ nhập câu trả lời văn bản.
                        </div>
                    )}

                    <button className="btn btn-save-float" onClick={handleUpdateCurrentQuestion}>
                        Lưu câu hỏi
                    </button>
                </div>
            ) : (
                <div style={{marginTop: 50, textAlign:'center'}}>Chưa có câu hỏi.</div>
            )}
        </main>
      </div>
    </div>
  );
};