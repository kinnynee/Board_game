import { useState, useEffect } from 'react';
import { api } from '../api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    api.adminGetUsers().then(setUsers).catch(console.error).finally(() => setLoading(false));
  };

  const toggleActive = async (user) => {
    try {
      await api.adminUpdateUser(user.id, { is_active: user.is_active ? 0 : 1 });
      loadUsers();
    } catch (err) { alert(err.message); }
  };

  const toggleRole = async (user) => {
    try {
      await api.adminUpdateUser(user.id, { role: user.role === 'admin' ? 'user' : 'admin' });
      loadUsers();
    } catch (err) { alert(err.message); }
  };

  const resetPw = async (id) => {
    if (!confirm('Reset mật khẩu về 123456?')) return;
    try {
      await api.adminResetPassword(id);
      alert('Đã reset mật khẩu!');
    } catch (err) { alert(err.message); }
  };

  const deleteUser = async (id) => {
    if (!confirm('Xóa người dùng này?')) return;
    try {
      await api.adminDeleteUser(id);
      loadUsers();
    } catch (err) { alert(err.message); }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>👥 Quản lý người dùng</h1>
        <p>Quản lý tài khoản, phân quyền và trạng thái người dùng</p>
      </div>
      <div className="card">
        <table className="data-table">
          <thead>
            <tr><th>ID</th><th>Username</th><th>Tên</th><th>Email</th><th>Vai trò</th><th>Trạng thái</th><th>Thao tác</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td style={{ fontWeight: 600 }}>@{u.username}</td>
                <td>{u.display_name}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                <td>
                  <span className={`badge ${u.role === 'admin' ? 'badge-info' : 'badge-success'}`}>{u.role}</span>
                </td>
                <td>
                  <span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>{u.is_active ? 'Active' : 'Disabled'}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => toggleRole(u)} title="Đổi vai trò">👑</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => toggleActive(u)} title="Bật/Tắt">
                      {u.is_active ? '🔒' : '🔓'}
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => resetPw(u.id)} title="Reset mật khẩu">🔑</button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u.id)} title="Xóa">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
