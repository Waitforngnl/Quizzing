import React, { useState } from 'react';

interface RegisterPageProps {
  onSwitch: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSwitch }) => {
  // 1. Add State
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 2. Handle Register Logic
  const handleRegister = async () => {
    setError(null);

    // Basic Validation
    if (password !== confirmPass) {
        return setError("Mật khẩu xác nhận không khớp!");
    }
    if (password.length < 8) {
        return setError("Mật khẩu phải có ít nhất 8 ký tự.");
    }

    setIsLoading(true);
    try {
        const res = await fetch('http://localhost:5000/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, username, password })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Đăng ký thất bại");
        }

        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        onSwitch(); // Switch to Login view

    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-form-section">
          <h2 style={{ textAlign: 'left', marginBottom: '30px' }}>Đăng ký tài khoản</h2>
          
          <div className="input-group">
            <label>Email:</label>
            <input 
                type="email" 
                placeholder="Example@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>Username:</label>
            <input 
                type="text" 
                placeholder="Example" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          
          {/* Note: Verification Code UI kept for future, not connected yet */}
          {/* <div className="verify-row">
            <div className="verify-btn-group">
              <span className="helper-text">Tính năng gửi mã đang phát triển...</span>
              <button className="btn-send-code" type="button" disabled>Gửi mã</button>
            </div>
            
            <div className="input-group" style={{ flex: 1 }}>
              <label>Mã xác nhận Email:</label>
              <input type="text" placeholder="6 chữ số" disabled />
            </div>
          </div> */}
          
          <div className="input-group">
            <label>Password (Mật khẩu):</label>
            <input 
                type="password" 
                placeholder="Tối thiểu 8 ký tự" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Xác nhận mật khẩu:</label>
            <input 
                type="password" 
                placeholder="Nhập lại mật khẩu" 
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
            />
          </div>
          
          {error && <div style={{color: 'red', marginTop: 10}}>{error}</div>}

          <button 
            className="btn-primary" 
            style={{ marginTop: '20px' }}
            onClick={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? "Đang xử lý..." : "Đăng ký"}
          </button>

          <p style={{ textAlign: 'center', fontSize: '1.1rem', marginTop: '30px' }}>
            Đã có tài khoản?{' '}
            <a 
              href="#" 
              onClick={(e) => { 
                e.preventDefault(); 
                onSwitch();
              }} 
              style={{ color: '#3498db', textDecoration: 'none', fontWeight: 'bold' }}
            >
              Đăng nhập tại đây
            </a>
          </p>
        </div>
        
        <div className="onquiz-logo">OnQuiz</div>
      </div>
    </div>
  );
};