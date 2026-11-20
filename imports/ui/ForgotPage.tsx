import React from 'react';

interface ForgotPageProps {
  onSwitch: () => void;
}

export const ForgotPage: React.FC<ForgotPageProps> = ({ onSwitch }) => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-form-section">
          <h2 style={{ textAlign: 'left', marginBottom: '10px' }}>Quên mật khẩu</h2>
          <h4 style={{ textAlign: 'left', marginBottom: '20px', fontWeight: '500' }}>Đặt lại mật khẩu:</h4>
          
          {/* Email + Gửi mã */}
          <div className="input-group">
            <label>Email (Địa chỉ email):</label>
            <input type="email" placeholder="Example@email.com" />
          </div>

          <div className="verify-row" style={{ marginBottom: '20px' }}>
            <button className="btn-send-code" type="button" style={{ height: '45px' }}>Gửi mã</button>
            <span className="helper-text" style={{ alignSelf: 'center', fontSize: '0.8rem', color: '#888' }}>
              Còn ... giây nữa để gửi lại
            </span>
          </div>
          
          <div className="input-group">
            <label>Mã xác nhận đặt lại mật khẩu:</label>
            <input type="text" placeholder="6 chữ số" />
          </div>

          <div className="input-group">
            <label>New password (Mật khẩu mới):</label>
            <input type="password" placeholder="Tối thiểu 8 ký tự" />
          </div>

          <div className="input-group">
            <label>Xác nhận mật khẩu mới:</label>
            <input type="password" placeholder="Tối thiểu 8 ký tự" />
          </div>
          
          <button 
            className="btn-primary" 
            style={{ marginTop: '20px' }}
            onClick={() => alert('Mật khẩu đã được đặt lại!')}
          >
            Chuyển sang đăng nhập
          </button>
          
          <p style={{ textAlign: 'center', marginTop: '20px' }}>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); onSwitch(); }} 
              style={{ color: '#3498db', textDecoration: 'none', fontWeight: 'bold' }}
            >
              Quay lại đăng nhập
            </a>
          </p>
        </div>
        <div className="onquiz-logo">OnQuiz</div>
      </div>
    </div>
  );
};