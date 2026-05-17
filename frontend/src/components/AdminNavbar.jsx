import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './AdminNavbar.css';

function AdminNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: 'Admin' });
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const isActive = (path) => {
    return location.pathname === path ? 'admin-nav-link active' : 'admin-nav-link';
  };

// CẬP NHẬT HÀM HANDLE LOGOUT GHI LOG ĐĂNG XUẤT:
  const handleLogout = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn đăng xuất không?')) return;

    try {
      const token = localStorage.getItem('token');
      const username = user.name || 'Admin';

      // Gọi API tạo log
      await fetch('http://localhost:5001/api/audit-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user: username,
          action: 'Đăng xuất',
          detail: `Quản trị viên ${username} đã chủ động đăng xuất khỏi hệ thống.`
        })
      });
    } catch (err) {
      console.error('Lỗi ghi nhận log đăng xuất:', err);
    } finally {
      // Luôn thực hiện xóa bộ nhớ và chuyển hướng dù API log có lỗi hay không
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      navigate('/login');
    }
  };

  return (
    <nav className="admin-navbar">
      <div className="admin-navbar-container">
        <div className="admin-navbar-logo">
          <Link to="/admin">Quizzing <span>Admin</span></Link>
        </div>

        <ul className="admin-navbar-menu">
          <li>
            <Link to="/admin" className={isActive('/admin')}>
              Dashboard
            </Link>
          </li>
        </ul>

        <div 
          className="admin-navbar-profile" 
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <div className="profile-info">
            <span className="profile-role">Administrator</span>
            <span className="profile-name">{user.name}</span>
          </div>
          <div className="profile-avatar">
            A
          </div>
          
          {showDropdown && (
            <div className="dropdown-menu">
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

export default AdminNavbar;