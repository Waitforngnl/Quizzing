// imports/ui/MainDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Layout } from './Layout';
import { PersonalInfo } from './PersonalInfo';
import { StatisticsView } from './Statistics';
import { HistoryPage } from './HistoryPage';
import { SearchResults } from './SearchResults';
import { DoQuizPage } from './DoQuizPage';
import { api } from '../api/routeQuiz';


export const MainDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Cá nhân');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [statsQuizId, setStatsQuizId] = useState<number | null>(null);
  const [doingQuizId, setDoingQuizId] = useState<number | null>(null);
  const [currentAttemptId, setCurrentAttemptId] = useState<number | null>(null);

  const [popularQuizzes, setPopularQuizzes] = useState<any[]>([]);

  useEffect(() => {
      if (activeTab === 'Khám phá') {
          api.getPopular().then(res => {
              if (res.quizzes) setPopularQuizzes(res.quizzes);
          });
      }
  }, [activeTab]);

  const handleSearch = async (query: string) => {
      setIsSearching(true);
      try {
          const res = await api.searchQuizzes(query);
          if (res.quizzes) {
              setSearchResults(res.quizzes);
          }
      } catch (e) {
          console.error(e);
      }
  };
  const handleStartQuiz = async (quizId: number) => {
      try {
          const res = await api.startAttempt(quizId);
          if (res.attempt) {
              setDoingQuizId(quizId);
              setCurrentAttemptId(res.attempt.id);
          } else {
              alert(res.message);
          }
      } catch (e) {
          alert("Không thể bắt đầu bài thi.");
      }
  };

  const handleExitQuiz = () => {
      setDoingQuizId(null);
      setCurrentAttemptId(null);
      // Optionally refresh history/dashboard
  };
  const exitSearch = () => {
      setIsSearching(false);
      setSearchResults([]);
  };

  const handleViewStats = (quizId: number) => {
      setStatsQuizId(quizId);
      setActiveTab('Thống kê');
  };

  // --- RENDER CONTENT ---
  const renderContent = () => {
      if (isSearching) {
          return <SearchResults results={searchResults} onBack={exitSearch} />;
      }
      if (doingQuizId && currentAttemptId) {
          return (
              <DoQuizPage 
                  quizId={doingQuizId} 
                  attemptId={currentAttemptId} 
                  onExit={handleExitQuiz} 
              />
          );
      }

      switch (activeTab) {
          case 'Cá nhân':
              return <PersonalInfo onViewStats={handleViewStats} />;
          
          case 'Lịch sử':
              return <HistoryPage />;
          
          case 'Thống kê':
              return (
                  <StatisticsView 
                      quizId={statsQuizId} 
                      onBack={() => { 
                          setStatsQuizId(null); 
                          setActiveTab('Cá nhân');
                      }} 
                  />
              );

          case 'Khám phá':
              return (
                  <div style={{padding: 20}}>
                      <h2>🔥 Quiz Nổi Bật</h2>
                      <div className="quiz-list-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                          {popularQuizzes.map(q => (
                              <div key={q.id} className="tool-card" style={{borderLeft: '4px solid #fdcb6e'}}>
                                  <h4>{q.name}</h4>
                                  <p>Lượt làm: <strong>{q.attempt_count}</strong></p>
                                  <button onClick={() => handleStartQuiz(q.id)}>Tham gia</button>
                              </div>
                          ))}
                      </div>
                  </div>
              );

          default:
              return <div>Đang phát triển...</div>;
      }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} onSearch={handleSearch}>
        {renderContent()}
    </Layout>
  );
};