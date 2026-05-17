import React, { useState } from 'react';
import AdminNavbar from '../../components/AdminNavbar';
import * as XLSX from 'xlsx'; // Import thư viện xử lý Excel
import './CreateUser.css';

function CreateUser() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [bulkMessage, setBulkMessage] = useState({ text: '', type: '' });
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  // 1. Xử lý Tạo thủ công (Giữ nguyên logic của bạn)
  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    try {
      const response = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.name, // Đồng bộ với backend nhận username
          email: formData.email,
          password: formData.password,
          role: formData.role,
          fullName: formData.name
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          text: `Đã tạo tài khoản ${formData.role === 'teacher' ? 'Giáo viên' : 'Học sinh'} thành công!`, 
          type: 'success' 
        });
        setFormData({ name: '', email: '', password: '', role: 'student' });
      } else {
        setMessage({ text: data.message || 'Tạo thất bại', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Lỗi kết nối server', type: 'error' });
    }
  };

  // 2. Xử lý Đọc file Excel và Import hàng loạt
  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setBulkMessage({ text: 'Đang đọc file Excel...', type: 'info' });
    setUploading(true);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        // Chuẩn hóa dữ liệu từ file Excel (hỗ trợ cả tiếng Anh lẫn tiếng Việt)
        const parsedUsers = data.map(row => ({
          username: row['Họ tên'] || row['Họ và tên'] || row['Name'] || row['username'],
          email: row['Email'] || row['email'],
          password: row['Mật khẩu'] || row['Password'] || row['password'],
          role: (row['Vai trò'] || row['Role'] || row['role'] || 'student').toLowerCase()
        })).filter(u => u.email && u.password); // Lọc bỏ dòng trống

        if (parsedUsers.length === 0) {
          setBulkMessage({ text: 'Không tìm thấy dữ liệu hợp lệ trong file Excel. File cần có cột: Họ tên, Email, Mật khẩu, Vai trò.', type: 'error' });
          setUploading(false);
          return;
        }

        // Gửi mảng dữ liệu này lên API Bulk Register của Backend
        const res = await fetch('http://localhost:5001/api/auth/bulk-register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ users: parsedUsers })
        });

        const result = await res.json();
        if (res.ok) {
          setBulkMessage({ text: `🎉 ${result.message}`, type: 'success' });
        } else {
          setBulkMessage({ text: result.message || 'Import thất bại', type: 'error' });
        }
      } catch (err) {
        setBulkMessage({ text: 'Có lỗi xảy ra khi xử lý file', type: 'error' });
      } finally {
        setUploading(false);
        e.target.value = ''; // Reset input file
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="admin-bg">
      <AdminNavbar />
      <div className="create-user-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        
        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
          
          {/* BÊN TRÁI: TẠO THỦ CÔNG */}
          <div className="form-card" style={{ flex: 1, minWidth: '350px' }}>
            <h2>Tạo tài khoản đơn lẻ</h2>
            <p>Nhập thông tin bên dưới để tạo nhanh 1 tài khoản.</p>
            
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label htmlFor="role">Loại tài khoản</label>
                <select id="role" value={formData.role} onChange={handleChange} className="form-select">
                  <option value="student">Học sinh</option>
                  <option value="teacher">Giáo viên</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="name">Họ và tên</label>
                <input type="text" id="name" value={formData.name} onChange={handleChange} required placeholder="Ví dụ: Nguyễn Văn A" />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email đăng nhập</label>
                <input type="email" id="email" value={formData.email} onChange={handleChange} required placeholder="user@school.com" />
              </div>

              <div className="form-group">
                <label htmlFor="password">Mật khẩu</label>
                <input type="text" id="password" value={formData.password} onChange={handleChange} required placeholder="Nhập mật khẩu..." />
              </div>

              {message.text && <div className={`message-box ${message.type}`}>{message.text}</div>}
              <button type="submit" className="btn-create">Tạo tài khoản</button>
            </form>
          </div>

          {/* BÊN PHẢI: IMPORT HÀNG LOẠT BẰNG EXCEL */}
          <div className="form-card" style={{ flex: 1, minWidth: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h2>Import tài khoản hàng loạt</h2>
              <p>Tải lên file Excel danh sách tài khoản để hệ thống tự động thiết lập.</p>
              
              <div style={{ background: '#f8fafc', border: '2px dashed #cbd5e1', padding: '40px 20px', borderRadius: '12px', textAlign: 'center', marginTop: '20px' }}>
                <input 
                  type="file" 
                  accept=".xlsx, .xls" 
                  id="excel-file" 
                  onChange={handleExcelUpload} 
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
                <label htmlFor="excel-file" style={{ cursor: uploading ? 'not-allowed' : 'pointer', color: '#3b82f6', fontWeight: 'bold', display: 'block' }}>
                  {uploading ? 'Đang xử lý tải lên...' : '➔ Bấm vào đây để chọn file Excel'}
                </label>
              </div>

              <div style={{ marginTop: '20px', fontSize: '13px', color: '#64748b', lineHeight: '1.6' }}>
                <strong>📌 Định dạng file Excel chuẩn:</strong>
                <ul style={{ paddingLeft: '20px', marginTop: '5px' }}>
                  <li>File cần có các cột tiêu đề ở dòng đầu tiên: <code>Họ tên</code>, <code>Email</code>, <code>Mật khẩu</code>, <code>Vai trò</code>.</li>
                  <li>Cột <strong>Vai trò</strong> điền giá trị là: <code>student</code> hoặc <code>teacher</code>.</li>
                </ul>
              </div>
            </div>

            {bulkMessage.text && (
              <div className={`message-box ${bulkMessage.type}`} style={{ marginTop: '20px' }}>
                {bulkMessage.text}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default CreateUser;