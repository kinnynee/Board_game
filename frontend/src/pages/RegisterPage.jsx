import { useState } from 'react';
<<<<<<< HEAD
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
      setError('Mat khau nhap lai chua trung khop.');
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
      navigate('/profile');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
=======
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', display_name: '' });
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      alert("Đăng ký không thành công!");
>>>>>>> 06170f5a5e6b6979cccd2b4ff1fd1ea4a02eb102
    }
  };

  return (
<<<<<<< HEAD
    <section className="auth-page">
      <div className="auth-card">
        <span className="auth-badge">Register</span>
        <h1>Tao tai khoan moi</h1>
        <p className="auth-subtitle">
          Form dang ky nay dung controlled inputs voi validation co ban, dung voi cach hoc React co ban.
        </p>

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
              placeholder="Ten hien thi"
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
            <label className="form-label" htmlFor="register-password">Mat khau</label>
            <input
              id="register-password"
              className="form-input"
              type="password"
              value={form.password}
              onChange={update('password')}
              placeholder="Toi thieu 6 ky tu"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-confirm-password">Nhap lai mat khau</label>
            <input
              id="register-confirm-password"
              className="form-input"
              type="password"
              value={form.confirmPassword}
              onChange={update('confirmPassword')}
              placeholder="Nhap lai mat khau"
              required
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Dang tao tai khoan...' : 'Dang ky'}
          </button>
        </form>

        <div className="auth-footer">
          Da co tai khoan? <Link to="/login">Dang nhap</Link>
        </div>
      </div>
    </section>
  );
}
=======
    <div className="auth-page">
      <h1>Tạo tài khoản</h1>
      <form onSubmit={handleSubmit}>
        <input placeholder="Username" onChange={e => setForm({...form, username: e.target.value})} />
        <input placeholder="Email" onChange={e => setForm({...form, email: e.target.value})} />
        <input type="password" placeholder="Mật khẩu" onChange={e => setForm({...form, password: e.target.value})} />
        <button type="submit">Đăng ký ngay</button>
      </form>
    </div>
  );
}
>>>>>>> 06170f5a5e6b6979cccd2b4ff1fd1ea4a02eb102
