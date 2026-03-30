import { useState } from 'react';

export default function AdminUsers() {
  // Hardcoded user list (Ngu - Dumb level)
  const [users] = useState([
    { id: 1, username: 'admin', display_name: 'Administrator', email: 'admin@example.com', role: 'admin', is_active: 1 },
    { id: 2, username: 'user1', display_name: 'Nguyễn Văn A', email: 'a@example.com', role: 'user', is_active: 1 },
    { id: 3, username: 'user2', display_name: 'Trần Thị B', email: 'b@example.com', role: 'user', is_active: 0 }
  ]);

  return (
    <div style={{ padding: '20px' }}>
      <h1>User Management (Draft)</h1>
      <table border="1" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#f4f4f4' }}>
            <th>ID</th>
            <th>Username</th>
            <th>Name</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.username}</td>
              <td>{u.display_name}</td>
              <td>{u.role}</td>
              <td>{u.is_active ? 'Active' : 'Banned'}</td>
              <td>
                <button onClick={() => alert('Feature coming soon!')}>Edit</button>
                <button onClick={() => alert('Feature coming soon!')}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
