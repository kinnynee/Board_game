import { useEffect, useState } from 'react';
import { api } from '../api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    api.admin.listUsers()
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  const handleUpdate = (userId, data) => {
    api.admin.updateUser(userId, data)
      .then(() => {
        fetchUsers();
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div className="admin-container">
      <header className="page-header">
        <h1>User Management</h1>
        <p>View and manage all registered users.</p>
      </header>

      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Display Name</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.display_name}</td>
                <td>
                  <span className={`badge badge-${user.role}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`badge badge-${user.is_active ? 'active' : 'inactive'}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-secondary btn-compact"
                    onClick={() => handleUpdate(user.id, { is_active: !user.is_active })}
                  >
                    Toggle Status
                  </button>
                  <button
                    className="btn btn-secondary btn-compact"
                    onClick={() => handleUpdate(user.id, { role: user.role === 'admin' ? 'user' : 'admin' })}
                  >
                    Toggle Role
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
