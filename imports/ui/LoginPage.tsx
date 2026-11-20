import React, { useState } from 'react';

interface LoginPageProps {
  onSwitch: () => void;
  onForgot: () => void;
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitch, onForgot, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // 2. Fetch call happens only when this function runs
      const response = await fetch('http://localhost:5000/login', { // Ensure this matches your backend route
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      // 3. Check for errors properly
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // 4. Success: Save data and redirect
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      onLoginSuccess();

    } catch (err: any) {
      // 5. Update the error state to show in UI
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-form-section">
          <h2>Welcome back</h2>
          
          {/* 6. Wrapped inputs in a form to handle 'Enter' key */}
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Email (Địa chỉ email):</label>
              <input 
                type="email" 
                placeholder="Example@email.com" 
                // 7. Inputs are now "Controlled" (linked to state)
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="input-group">
              <label>Password (Mật khẩu):</label>
              <input 
                type="password" 
                placeholder="Tối thiểu 8 ký tự" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div style={{ textAlign: 'right', marginBottom: '25px' }}>
              <a href="#"
               onClick={(e) => { e.preventDefault(); onForgot(); }}
               style={{ color: '#3498db', textDecoration: 'none', fontWeight: 500 }}
               >
                Quên mật khẩu?
              </a>
            </div>
            
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={isLoading}
            >
              {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
          </form>
          
          <div className="divider">
            <hr /> <span style={{ margin: '0 10px' }}>Hoặc</span> <hr />
          </div>
          
          <p style={{ textAlign: 'center', fontSize: '1.1rem' }}>
            Chưa có tài khoản?{' '}
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); onSwitch(); }} 
              style={{ color: '#3498db', textDecoration: 'none', fontWeight: 'bold' }}
            >
              tại đây
            </a>
          </p>
        </div>
        <div className="onquiz-logo">OnQuiz</div>
        {/* 8. Display the error message if it exists */}
        {error && (
          <div className='message' style={{color: 'red', textAlign: 'center', marginTop: '10px'}}>
            {error}
          </div>
        )}
      </div>
      
      
    </div>
  );
};