import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';
import TeacherNavbar from '../../components/TeacherNavbar';
import './ClassDetail.css'; // Bạn có thể tự tạo file CSS sau
import "./ClassDetail.css";

const ClassDetail = () => {
  const { id } = useParams();
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [emailInput, setEmailInput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClassDetails();
  }, [id]);

  const fetchClassDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/classes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClassData(res.data);
      setStudents(res.data.students || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Không thể tải thông tin lớp học");
    }
  };

  // Thêm thủ công bằng Email
  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/classes/${id}/add-student`, 
        { email: emailInput },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setEmailInput('');
      fetchClassDetails();
      alert("Đã thêm sinh viên thành công!");
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi thêm sinh viên");
    }
  };

  // Xử lý Import Excel (Đúng yêu cầu GV)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      
      // Giả sử file Excel có cột tên là "Email"
      const emails = data.map(row => row.Email || row.email).filter(email => email);
      
      if (emails.length > 0) {
        importStudents(emails);
      }
    };
    reader.readAsBinaryString(file);
  };

  const importStudents = async (emails) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/classes/${id}/import-students`, 
        { emails },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      fetchClassDetails();
      alert(`Đã import thành công ${emails.length} sinh viên!`);
    } catch (err) {
      alert("Lỗi khi import danh sách");
    }
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className="class-detail-container">
      <TeacherNavbar />
      <div className="content-section">
        <h1>Lớp: {classData?.className}</h1>
        <p>Mã tham gia: <strong>{classData?.joinCode}</strong></p>

        <div className="action-grid">
          <div className="action-card">
            <h3>Thêm sinh viên thủ công</h3>
            <form onSubmit={handleAddStudent}>
              <input 
                type="email" 
                placeholder="Nhập email sinh viên..." 
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                required 
              />
              <button type="submit">Thêm</button>
            </form>
          </div>

          <div className="action-card">
            <h3>Import từ Excel</h3>
            <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
            <p className="hint">File cần có cột "Email"</p>
          </div>
        </div>

        <h2>Danh sách sinh viên ({students.length})</h2>
        <table className="student-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {students.map((st, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{st.name || 'Chưa cập nhật'}</td>
                <td>{st.email}</td>
                <td><span className="status-joined">Đã tham gia</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClassDetail;