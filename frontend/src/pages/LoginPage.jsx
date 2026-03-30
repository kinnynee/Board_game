import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(username, password); 
  };

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit}>
        <input value={username} onChange={e => setUsername(e.target.value)} />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit">Đăng nhập</button>
      </form>
    </div>
  );
}