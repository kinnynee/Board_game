import { useState, useEffect } from 'react';
import { api } from '../api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setLoading(true);
    api.adminGetUsers()
      .then(setUsers)
      .catch(err => alert('Lỗi tải người dùng: ' + err.message))
      .finally(() => setLoading(false));
  };

  const toggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await api.adminUpdateUser(user.id, { role: newRole });
      loadUsers();
    } catch (err) { alert(err.message); }
  };

  const toggleActive = async (user) => {
    try {
      await api.adminUpdateUser(user.id, { is_active: user.is_active ? 0 : 1 });
      loadUsers();
    } catch (err) { alert(err.message); }
  };

  if (loading) return <div style={{ padding: '20px' }}>Đang tải danh sách người dùng...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>👥 Quản lý người dùng</h1>
      <table border="1" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#f4f4f4' }}>
            <th style={{ padding: '10px' }}>ID</th>
            <th style={{ padding: '10px' }}>Username</th>
            <th style={{ padding: '10px' }}>Tên hiển thị</th>
            <th style={{ padding: '10px' }}>Vai trò</th>
            <th style={{ padding: '10px' }}>Trạng thái</th>
            <th style={{ padding: '10px' }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td style={{ padding: '10px' }}>{u.id}</td>
              <td style={{ padding: '10px' }}>{u.username}</td>
              <td style={{ padding: '10px' }}>{u.display_name}</td>
              <td style={{ padding: '10px' }}>
                <span style={{ padding: '2px 8px', borderRadius: '4px', background: u.role === 'admin' ? '#ffeeba' : '#d4edda' }}>
                  {u.role}
                </span>
              </td>
              <td style={{ padding: '10px' }}>{u.is_active ? '✅ Hoạt động' : '❌ Đã khóa'}</td>
              <td style={{ padding: '10px' }}>
                <button onClick={() => toggleRole(u)} style={{ marginRight: '5px' }}>Đổi quyền</button>
                <button onClick={() => toggleActive(u)}>
                  {u.is_active ? 'Khóa' : 'Mở'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
