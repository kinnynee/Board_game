import { useState } from 'react';
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
    }
  };

  return (
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