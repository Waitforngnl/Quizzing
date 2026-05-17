import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminFeatures.css';

function AdminFeatures() {
  const navigate = useNavigate();

  return (
    <div className="admin-features">
      <h2 className="features-header">Chức năng chính</h2>
      <div className="features-grid">
        <div className="feature-card">
          <div className="card-body">
            <h3>Tạo User</h3>
            <p>Thêm tài khoản mới cho giáo viên hoặc học sinh.</p>
          </div>
          <div className="card-footer">
            <button className="btn-settings" onClick={() => navigate('/admin/create-user')}>SETTINGS</button>
          </div>
        </div>

        <div className="feature-card">
          <div className="card-body">
            <h3>Quản lý User</h3>
            <p>Quản lý, tìm kiếm và chỉnh sửa thông tin người dùng hiện có.</p>
          </div>
          <div className="card-footer">
            <button className="btn-settings" onClick={() => navigate('/admin/users')}>SETTINGS</button>
          </div>
        </div>

        <div className="feature-card">
          <div className="card-body">
            <h3>Quản lý thi</h3>
            <p>Quản lý bài thi.</p>
          </div>
          <div className="card-footer">
            <button className="btn-settings" onClick={() => navigate('/admin/exams')}>SETTINGS</button>
          </div>
        </div>

        <div className="feature-card">
          <div className="card-body">
            <h3>Lịch sử hoạt động</h3>
            <p>Xem lịch sử đăng nhập của người dùng trên hệ thống.</p>
          </div>
          <div className="card-footer">
            <button className="btn-settings" onClick={() => navigate('/admin/audit-log')}>SETTINGS</button>
          </div>
        </div>

        <div className="feature-card">
          <div className="card-body">
            <h3>Quản lý ngân hàng câu hỏi</h3>
            <p>Thêm, sửa, xóa và phân loại câu hỏi.</p>
          </div>
          <div className="card-footer">
            <button className="btn-settings" onClick={() => navigate('/admin/question-bank')}>SETTINGS</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminFeatures;
