// imports/ui/Layout.tsx
import React, { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSearch: (query: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, onSearch }) => {
  const [searchText, setSearchText] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchText.trim()) {
      onSearch(searchText);
    }
  };

  const menuItems = [
    { icon: '🏠', label: 'Cá nhân' },
    { icon: '🌎', label: 'Khám phá' }, // Public Quizzes
    { icon: '🛒', label: 'Lịch sử' },
    { icon: '📊', label: 'Thống kê' }, // Replaced "Dữ liệu" with Stats
  ];

  return (
    <div className="dashboard-wrapper">
      {/* HEADER */}
      <header className="dashboard-header">
        <div className="onquiz-logo" style={{ color: '#ff7675', fontWeight: 800, fontSize: '1.8rem' }}>
          OnQuiz
        </div>
        
        {/* SEARCH BAR */}
        <form onSubmit={handleSearchSubmit} className="search-bar">
          <button type="submit" style={{background:'none', border:'none', cursor:'pointer'}}>🔍</button>
          <input 
            type="text" 
            placeholder="Tìm kiếm Quiz public..." 
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </form>

        <div className="header-right">
          <span className="status-badge">Online</span>
          <span style={{ fontSize: '1.2rem', cursor: 'pointer' }}>👤</span>
        </div>
      </header>

      {/* BODY */}
      <div className="dashboard-body">
        <aside className="sidebar">
          {menuItems.map((item, idx) => (
            <div 
              key={idx} 
              className={`sidebar-item ${activeTab === item.label ? 'active' : ''}`}
              onClick={() => onTabChange(item.label)}
            >
              <span>{item.icon}</span> {item.label}
            </div>
          ))}
          <div className="sidebar-spacer"></div>
          <div className="sidebar-footer-item">Ver 1.0</div>
        </aside>

        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};