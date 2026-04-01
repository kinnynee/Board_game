import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    display_name: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu nhập lại chưa trùng khớp.');
      return;
    }

    setLoading(true);

    try {
      await register({
        username: form.username,
        email: form.email,
        password: form.password,
        display_name: form.display_name,
      });
      navigate('/');
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
            <span className="auth-badge">Register</span>
            <h1>Tạo tài khoản mới</h1>
            <p className="auth-subtitle">
              Form đăng ký này dùng controlled inputs với validation cơ bản, nhưng giao diện đã được sắp xếp rõ hơn để dễ nhập liệu.
            </p>
          </div>

          <div className="auth-helper-card">
            <strong>Cần gì để bắt đầu?</strong>
            <p>Chỉ cần username, email hợp lệ, và mật khẩu trùng khớp là bạn có thể vào app ngay sau khi đăng ký.</p>
          </div>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="register-username">Username</label>
            <input
              id="register-username"
              className="form-input"
              value={form.username}
              onChange={update('username')}
              placeholder="username"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-display-name">Display name</label>
            <input
              id="register-display-name"
              className="form-input"
              value={form.display_name}
              onChange={update('display_name')}
              placeholder="Tên hiển thị"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-email">Email</label>
            <input
              id="register-email"
              className="form-input"
              type="email"
              value={form.email}
              onChange={update('email')}
              placeholder="email@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-password">Mật khẩu</label>
            <input
              id="register-password"
              className="form-input"
              type="password"
              value={form.password}
              onChange={update('password')}
              placeholder="Tối thiểu 6 ký tự"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-confirm-password">Nhập lại mật khẩu</label>
            <input
              id="register-confirm-password"
              className="form-input"
              type="password"
              value={form.confirmPassword}
              onChange={update('confirmPassword')}
              placeholder="Nhập lại mật khẩu"
              required
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
          </button>
        </form>

        <div className="auth-tips">
          <div className="tip-item">
            <strong>Display name</strong>
            <p>Bạn có thể để trống lúc tạo tài khoản và cập nhật sau trong trang profile.</p>
          </div>
          <div className="tip-item">
            <strong>Mật khẩu</strong>
            <p>Hãy chọn mật khẩu dễ nhớ nhưng không quá ngắn, vì đây là thông tin sẽ dùng để đăng nhập lại.</p>
          </div>
        </div>

        <div className="auth-footer">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </div>
      </div>
    </section>
  );
}
