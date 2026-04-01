import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function normalizeForm(form) {
  return {
    username: form.username.trim(),
    email: form.email.trim().toLowerCase(),
    password: form.password,
    confirmPassword: form.confirmPassword,
    display_name: form.display_name.trim(),
  };
}

function validateRegisterForm(form) {
  if (form.username.length < 3) {
    return 'Username phải có ít nhất 3 ký tự.';
  }

  if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
    return 'Username chỉ nên gồm chữ, số hoặc dấu gạch dưới.';
  }

  if (!form.email) {
    return 'Vui lòng nhập email.';
  }

  if (form.password.length < 6) {
    return 'Mật khẩu phải có ít nhất 6 ký tự.';
  }

  if (form.password !== form.confirmPassword) {
    return 'Mật khẩu nhập lại chưa trùng khớp.';
  }

  if (form.display_name.length > 50) {
    return 'Display name không nên vượt quá 50 ký tự.';
  }

  return '';
}

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
  const normalizedForm = normalizeForm(form);
  const canSubmit =
    normalizedForm.username &&
    normalizedForm.email &&
    normalizedForm.password &&
    normalizedForm.confirmPassword;

  const update = (field) => (event) => {
    const value = field === 'email' ? event.target.value.trimStart() : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const nextForm = normalizeForm(form);
    const validationError = validateRegisterForm(nextForm);

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      await register({
        username: nextForm.username,
        email: nextForm.email,
        password: nextForm.password,
        display_name: nextForm.display_name || nextForm.username,
      });
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
            <span className="auth-badge">Register</span>
            <h1>Tạo tài khoản mới</h1>
          </div>

          <div className="auth-helper-card">
            <p>username hợp lệ, email đúng định dạng và mật khẩu khớp nhau.</p>
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
              autoComplete="username"
              minLength={3}
              maxLength={30}
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
              maxLength={50}
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
              autoComplete="email"
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
              autoComplete="new-password"
              minLength={6}
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
              autoComplete="new-password"
              required
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={!canSubmit || loading}>
            {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
          </button>
        </form>

        <div className="auth-tips">
          <div className="tip-item">
            <strong>Display name</strong>
            <p>Bạn có thể để trống lúc tạo tài khoản, hệ thống sẽ tạm lấy username và bạn có thể đổi sau trong profile.</p>
          </div>
          <div className="tip-item">
            <strong>Mật khẩu</strong>
            <p>Đặt mật khẩu dễ nhớ nhưng không quá ngắn.</p>
          </div>
        </div>

        <div className="auth-footer">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </div>
      </div>
    </section>
  );
}
