import React, { useEffect, useState } from 'react';
import { api } from '../api/routeQuiz';

interface HistoryItem {
    attempt_id: number;
    quiz_name: string;
    score: number;
    started_at: string;
    status: string;
}

export const HistoryPage: React.FC = () => {
    const [history, setHistory] = useState<HistoryItem[]>([]);

    useEffect(() => {
        api.getHistory().then(res => {
            if (res.history) setHistory(res.history);
        });
    }, []);

    return (
        <div style={{padding: 20}}>
            <h2>Lịch sử làm bài</h2>
            {history.length === 0 ? <p>Bạn chưa làm quiz nào.</p> : (
                <div style={{display: 'grid', gap: 15}}>
                    {history.map((h, i) => (
                        <div key={i} style={{
                            padding: 15, border: '1px solid #ddd', borderRadius: 8, background: 'white',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <div>
                                <h3 style={{margin: 0}}>{h.quiz_name}</h3>
                                <small>{new Date(h.started_at).toLocaleString()}</small>
                            </div>
                            <div style={{textAlign: 'right'}}>
                                <div style={{fontSize: '1.2rem', fontWeight: 'bold', color: '#6c5ce7'}}>
                                    {h.score} điểm
                                </div>
                                <span style={{
                                    padding: '2px 8px', borderRadius: 4, fontSize: '0.8rem',
                                    background: h.status === 'completed' ? '#d4edda' : '#fff3cd',
                                    color: h.status === 'completed' ? '#155724' : '#856404'
                                }}>
                                    {h.status === 'completed' ? 'Hoàn thành' : 'Đang làm'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};