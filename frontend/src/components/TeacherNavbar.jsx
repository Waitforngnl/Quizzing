import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './TeacherNavbar.css';

function TeacherNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: 'Giáo viên' });
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const isActive = (path) => location.pathname.startsWith(path) ? 'teacher-nav-link active' : 'teacher-nav-link';

// CẬP NHẬT HÀM HANDLE LOGOUT GHI LOG ĐĂNG XUẤT:
  const handleLogout = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn đăng xuất không?')) return;

    try {
      const token = localStorage.getItem('token');
      const username = user.name || 'Giáo viên';

      await fetch('http://localhost:5001/api/audit-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user: username,
          action: 'Đăng xuất',
          detail: `Giáo viên ${username} đã đăng xuất khỏi hệ thống.`
        })
      });
    } catch (err) {
      console.error('Lỗi ghi nhận log đăng xuất:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      navigate('/login');
    }
  };

  return (
    <nav className="teacher-navbar">
      <div className="teacher-navbar-container">
        <div className="teacher-navbar-logo">
          <Link to="/teacher">Quizzing <span>Teacher</span></Link>
        </div>

        <ul className="teacher-navbar-menu">
          <li>
            <Link to="/teacher" className={location.pathname === '/teacher' ? 'teacher-nav-link active' : 'teacher-nav-link'}>
              Tổng quan
            </Link>
          </li>
          {/* TÍNH NĂNG MỚI: Nút Quản lý Lớp học */}
          <li>
            <Link to="/teacher/classes" className={location.pathname.startsWith('/teacher/classes') ? 'teacher-nav-link active' : 'teacher-nav-link'}>
              Quản lý Lớp học
            </Link>
          </li>
          <li>
            <Link to="/teacher/organize" className={location.pathname === '/teacher/organize' ? 'teacher-nav-link active' : 'teacher-nav-link'}>
              Tổ chức thi
            </Link>
          </li>
          <li>
            <Link to="/teacher/create" className={isActive('/teacher/create')}>
              Tạo mới
            </Link>
          </li>
          <li>
            <Link to="/teacher/history" className={location.pathname === '/teacher/history' ? 'teacher-nav-link active' : 'teacher-nav-link'}>
              Lịch sử bài thi
            </Link>
          </li>
        </ul>

        <div 
          className="teacher-navbar-profile"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <div className="profile-info">
            <span className="profile-role">Giáo viên</span>
            <span className="profile-name">{user.name}</span>
          </div>
          <div className="profile-avatar">
            {user.name ? user.name.charAt(0).toUpperCase() : 'G'}
          </div>

          {showDropdown && (
            <div className="dropdown-menu">
              <div className="dropdown-item" onClick={() => navigate('/teacher/profile-edit')}>
                Chỉnh sửa thông tin
              </div>
              <div className="dropdown-item" onClick={handleLogout}>
                Đăng xuất
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default TeacherNavbar;