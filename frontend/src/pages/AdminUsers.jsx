import { useState, useEffect } from 'react';
import { api } from '../api';
import './Admin.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadUsers(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const loadUsers = (search = '') => {
    setLoading(true);
    api.adminGetUsers(search)
      .then(setUsers)
      .catch(err => showToast('Lỗi: ' + err.message))
      .finally(() => setLoading(false));
  };

  const handleAction = async () => {
    if (!confirmModal) return;
    const { type, user } = confirmModal;
    try {
      if (type === 'role') {
        const newRole = user.role === 'admin' ? 'user' : 'admin';
        await api.adminUpdateUser(user.id, { role: newRole });
        showToast(`Đã đổi quyền cho ${user.username} thành ${newRole}`);
      } else if (type === 'status') {
        await api.adminUpdateUser(user.id, { is_active: user.is_active ? 0 : 1 });
        showToast(`Đã ${user.is_active ? 'khóa' : 'mở khóa'} tài khoản ${user.username}`);
      }
      loadUsers(searchTerm);
    } catch (err) {
      showToast('Lỗi: ' + err.message);
    } finally {
      setConfirmModal(null);
    }
  };

  if (loading && searchTerm === '') return <div className="admin-container">Đang tải danh sách người dùng Pro...</div>;

  return (
    <div className="admin-container">
      {/* Toast Notification */}
      {toast && (
        <div className="toast-container">
          <div className="toast">✨ {toast}</div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Xác nhận thao tác</h3>
            <p>Bạn có chắc chắn muốn thực hiện thay đổi này cho người dùng <strong>{confirmModal.user.username}</strong> không?</p>
            <div className="modal-actions">
              <button className="btn-pro btn-outline" onClick={() => setConfirmModal(null)}>Hủy</button>
              <button className="btn-pro btn-primary" onClick={handleAction}>Xác nhận</button>
            </div>
          </div>
        </div>
      )}

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
                    <button className="btn-pro btn-outline" onClick={() => setConfirmModal({ type: 'role', user: u })}>Đổi quyền</button>
                    <button 
                      className={`btn-pro ${u.is_active ? 'btn-outline' : 'btn-primary'}`}
                      onClick={() => setConfirmModal({ type: 'status', user: u })}
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
