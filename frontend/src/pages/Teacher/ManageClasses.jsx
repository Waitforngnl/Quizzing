import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import TeacherNavbar from '../../components/TeacherNavbar';
import './CreateQuestion.css'; 

function ManageClasses() {
  const [classes, setClasses] = useState([]);
  const [newClassName, setNewClassName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/classes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setClasses(data);
      }
      setLoading(false);
    } catch (err) {
      setError('Lỗi khi tải danh sách lớp');
      setLoading(false);
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!newClassName.trim()) return alert('Vui lòng nhập tên lớp');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/classes/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ className: newClassName })
      });

      if (res.ok) {
        setNewClassName('');
        fetchClasses();
        alert('Tạo lớp thành công!');
      } else {
        const errData = await res.json();
        alert(`Lỗi: ${errData.message}`);
      }
    } catch (err) {
      alert('Không thể kết nối đến máy chủ');
    }
  };

  return (
    <div className="teacher-bg">
      <TeacherNavbar />
      <div className="create-exam-container">
        <div className="page-header">
          <h2>Quản Lý Lớp Học & Phân Quyền</h2>
        </div>

        <div className="exam-layout" style={{ display: 'flex', gap: '20px' }}>
          {/* FORM TẠO LỚP */}
          <div className="settings-card" style={{ flex: 1 }}>
            <h3 className="card-title">Tạo Lớp Mới</h3>
            <form onSubmit={handleCreateClass}>
              <div className="form-group">
                <label className="form-label">Tên lớp (VD: Toán 12A1)</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="Nhập tên lớp..." 
                  value={newClassName} 
                  onChange={e => setNewClassName(e.target.value)} 
                />
              </div>
              <button type="submit" className="btn-submit" style={{ width: '100%' }}>
                TẠO LỚP
              </button>
            </form>
          </div>

          {/* DANH SÁCH LỚP */}
          <div className="bank-card" style={{ flex: 2 }}>
            <h3 className="card-title">Danh Sách Lớp ({classes.length})</h3>
            
            {loading ? <p>Đang tải...</p> : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                    <th style={{ padding: '10px' }}>Tên Lớp</th>
                    <th style={{ padding: '10px' }}>Mã Lớp</th>
                    <th style={{ padding: '10px' }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map(c => (
                    <tr key={c._id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{c.className}</td>
                      <td style={{ padding: '10px' }}>
                        <code style={{ background: '#eee', padding: '2px 5px' }}>{c.joinCode}</code>
                      </td>
                      <td style={{ padding: '10px' }}>
                        {/* NÚT CHI TIẾT ĐỂ VÀO TRANG IMPORT EXCEL */}
                        <button 
                          onClick={() => navigate(`/teacher/class/${c._id}`)}
                          style={{ 
                            padding: '5px 12px', 
                            backgroundColor: '#3498db', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Xem chi tiết & Thêm SV
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageClasses;