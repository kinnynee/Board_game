import { useState, useEffect } from 'react';
import { api } from '../api';
import './Admin.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadUsers(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const loadUsers = (search = '') => {
    setLoading(true);
    api.adminGetUsers(search)
      .then(setUsers)
      .catch(err => alert('Lỗi tải người dùng: ' + err.message))
      .finally(() => setLoading(false));
  };

  const toggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await api.adminUpdateUser(user.id, { role: newRole });
      loadUsers(searchTerm);
    } catch (err) { alert(err.message); }
  };

  if (loading && searchTerm === '') return <div className="admin-container">Đang tải danh sách người dùng Pro...</div>;

  return (
    <div className="admin-container">
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.875rem', fontWeight: 700 }}>Quản lý người dùng</h1>
        <p style={{ color: '#64748b' }}>Phân quyền và kiểm soát trạng thái tài khoản hệ thống.</p>
      </header>

      <div className="glass-card">
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên, username hoặc email..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn-pro btn-outline" onClick={() => loadUsers(searchTerm)}>Làm mới</button>
        </div>

        <table className="pro-table">
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{u.display_name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>@{u.username} • {u.email}</div>
                </td>
                <td>
                  <span className={`badge ${u.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td>
                  <span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>
                    {u.is_active ? 'Hoạt động' : 'Đã khóa'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-pro btn-outline" onClick={() => toggleRole(u)}>Đổi quyền</button>
                    <button 
                      className={`btn-pro ${u.is_active ? 'btn-outline' : 'btn-primary'}`}
                      onClick={async () => {
                        try {
                          await api.adminUpdateUser(u.id, { is_active: u.is_active ? 0 : 1 });
                          loadUsers(searchTerm);
                        } catch (err) { alert(err.message); }
                      }}
                    >
                      {u.is_active ? 'Khóa' : 'Mở khóa'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            Không tìm thấy người dùng nào phù hợp.
          </div>
        )}
      </div>
    </div>
  );
}
