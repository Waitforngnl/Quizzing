import React, { useState, useEffect } from 'react';
import AdminNavbar from '../../components/AdminNavbar';
import AdminFeatures from './AdminFeatures';
import './AdminDashboard.css';

function AdminDashboard() {
  const [stats, setStats] = useState({ 
    totalUsers: 0, 
    totalTeachers: 0, 
    totalStudents: 0, 
    totalExams: 0 
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/admin/stats');
      if (!res.ok) throw new Error('Không thể lấy dữ liệu');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Lỗi Dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(); // Chạy ngay khi mở trang

    // Cập nhật thời gian thực mỗi 30 giây
    const interval = setInterval(fetchStats, 30000); 

    // Xóa bộ đếm khi thoát trang để tiết kiệm tài nguyên
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="admin-bg">
      <AdminNavbar />
      <div className="admin-container">
        <div className="admin-header">
          <h1>Hệ thống quản trị</h1>
          <p>Dữ liệu được cập nhật tự động sau mỗi 30 giây</p>
        </div>

        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <h3>Tổng người dùng</h3>
            <p className="admin-stat-number">{loading ? '...' : stats.totalUsers}</p>
          </div>
          <div className="admin-stat-card">
            <h3>Giáo viên</h3>
            <p className="admin-stat-number text-purple">{loading ? '...' : stats.totalTeachers}</p>
          </div>
          <div className="admin-stat-card">
            <h3>Học sinh</h3>
            <p className="admin-stat-number text-blue">{loading ? '...' : stats.totalStudents}</p>
          </div>
          <div className="admin-stat-card">
            <h3>Bài thi đã tạo</h3>
            <p className="admin-stat-number">{loading ? '...' : stats.totalExams}</p>
          </div>
        </div>
        
        <AdminFeatures />
      </div>
    </div>
  );
}

export default AdminDashboard;