import React, { useState } from 'react';
import StudentNavbar from '../../components/StudentNavbar';
import axios from 'axios';
import './JoinClass.css';

function JoinClass() {
  const [joinCode, setJoinCode] = useState('');
  const [message, setMessage] = useState('');

  const handleJoin = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5001/api/classes/join', 
        { joinCode: joinCode.toUpperCase() },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setMessage(`✅ ${res.data.message}: ${res.data.className}`);
      setJoinCode('');
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.message || 'Lỗi tham gia lớp'}`);
    }
  };

  return (
    <div className="join-class-container">
      <StudentNavbar />
      <div className="join-card">
        <h2>Gia nhập lớp học</h2>
        <p>Nhập mã lớp gồm 6 ký tự để bắt đầu tham gia các bài kiểm tra.</p>

        <form onSubmit={handleJoin}>
          <input 
            className="join-input"
            type="text" 
            maxLength="6"
            placeholder="MÃ LỚP (VD: AB1234)" 
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
          />
          <button type="submit" className="join-button">
            XÁC NHẬN THAM GIA
          </button>
        </form>

        {message && (
          <div className={`message-box ${message.includes('✅') ? 'message-success' : 'message-error'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default JoinClass;