// imports/ui/SearchResults.tsx
import React from 'react';
import { api } from '../api/routeQuiz';

interface SearchResultsProps {
    results: any[];
    onBack: () => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ results, onBack }) => {
    
    const handleJoin = async (quizId: number) => {
        try {
            const res = await api.startAttempt(quizId);
            if(res.attemptId) {
                alert("Bắt đầu làm bài! (Tính năng làm bài đang phát triển)");
            } else {
                alert(res.message);
            }
        } catch (e: any) {
            alert(e.message);
        }
    };

    return (
        <div style={{padding: 20}}>
            <div style={{display:'flex', alignItems:'center', marginBottom: 20}}>
                <button onClick={onBack} className="btn-secondary" style={{marginRight: 15}}>⬅ Quay lại</button>
                <h2>Kết quả tìm kiếm ({results.length})</h2>
            </div>

            {results.length === 0 ? (
                <p>Không tìm thấy Quiz nào phù hợp.</p>
            ) : (
                <div className="quiz-list-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                    {results.map((quiz) => (
                        <div key={quiz.id} className="tool-card" style={{borderLeft: '4px solid #00b894'}}>
                            <h4>{quiz.name}</h4>
                            <p>Tác giả: {quiz.user_username || 'Ẩn danh'}</p>
                            <small>Bắt đầu: {quiz.startedAt ? new Date(quiz.startedAt).toLocaleDateString() : 'Tự do'}</small>
                            <button 
                                className="btn-primary" 
                                style={{width:'100%', marginTop: 10}}
                                onClick={() => handleJoin(quiz.id)}
                            >
                                Làm bài ngay
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};