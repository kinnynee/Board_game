import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const canSubmit = username.trim() && password;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const identifier = username.trim();

    if (!identifier || !password) {
      setError('Vui lòng nhập username/email và mật khẩu.');
      return;
    }

    setLoading(true);

    try {
      await login(identifier, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div>
            <span className="auth-badge">Sign In</span>
            <h1>Đăng nhập tài khoản</h1>
            <p className="auth-subtitle">
              Đăng nhập để truy cập profile, lưu trạng thái người dùng và tiếp tục làm việc trên Board Game Project.
            </p>
          </div>

          <div className="auth-helper-card">
            <strong>Vào nhanh</strong>
            <p>Bạn có thể dùng username hoặc email để đăng nhập, sau đó hệ thống sẽ tự tải lại thông tin từ token.</p>
          </div>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-username">Username hoặc email</label>
            <input
              id="login-username"
              className="form-input"
              type="text"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                if (error) {
                  setError('');
                }
              }}
              placeholder="Nhập username hoặc email"
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Mật khẩu</label>
            <input
              id="login-password"
              className="form-input"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (error) {
                  setError('');
                }
              }}
              placeholder="Nhập mật khẩu"
              autoComplete="current-password"
              required
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={!canSubmit || loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="auth-tips">
          <div className="tip-item">
            <strong>Mẹo nhỏ</strong>
            <p>Nếu vừa đăng ký xong, bạn có thể đăng nhập ngay với thông tin vừa tạo.</p>
          </div>
          <div className="tip-item">
            <strong>Session</strong>
            <p>Trang sẽ tự động giữ phiên đăng nhập bằng token cho tới khi bạn logout.</p>
          </div>
        </div>

        <div className="auth-footer">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </div>
      </div>
    </section>
  );
}
