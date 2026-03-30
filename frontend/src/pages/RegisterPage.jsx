import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const { register } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    register(form);
  };

  return (
    <div className="auth-page">
      <h1>Đăng ký tài khoản</h1>
      <form onSubmit={handleSubmit}>
        <input value={form.username} onChange={e => setForm({...form, username: e.target.value})} placeholder="Username" />
        <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
        <button type="submit">Đăng ký</button>
      </form>
    </div>
  );
}