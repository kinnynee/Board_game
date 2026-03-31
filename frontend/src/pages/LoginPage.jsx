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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
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
        <span className="auth-badge">Sign In</span>
        <h1>Dang nhap tai khoan</h1>
        <p className="auth-subtitle">
          Dang nhap de truy cap profile va tiep tuc cap nhat do an theo luong da hoc.
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-username">Username hoac email</label>
            <input
              id="login-username"
              className="form-input"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Nhap username hoac email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Mat khau</label>
            <input
              id="login-password"
              className="form-input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Nhap mat khau"
              required
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Dang dang nhap...' : 'Dang nhap'}
          </button>
        </form>

        <div className="auth-footer">
          Chua co tai khoan? <Link to="/register">Dang ky ngay</Link>
        </div>
      </div>
    </section>
  );
}
