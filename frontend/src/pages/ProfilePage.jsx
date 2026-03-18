import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';

export default function ProfilePage() {
  const { id } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [scores, setScores] = useState([]);

  const isOwnProfile = currentUser && parseInt(id) === currentUser.id;

  useEffect(() => {
    api.getProfile(id).then(p => { setProfile(p); setForm({ display_name: p.display_name || '', bio: p.bio || '', email: p.email || '' }); }).catch(console.error);
    if (isOwnProfile) api.getMyScores().then(setScores).catch(console.error);
  }, [id]);

  const handleSave = async () => {
    try {
      const updated = await api.updateProfile(form);
      setProfile(prev => ({ ...prev, ...updated }));
      updateUser(updated);
      setEditing(false);
    } catch (err) { alert(err.message); }
  };

  if (!profile) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="page-content">
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div className="avatar avatar-xl">{profile.display_name?.[0] || '?'}</div>
          <div style={{ flex: 1 }}>
            {editing ? (
              <div>
                <div className="form-group">
                  <input className="form-input" value={form.display_name} onChange={e => setForm({ ...form, display_name: e.target.value })} placeholder="Tên hiển thị" />
                </div>
                <div className="form-group">
                  <input className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" />
                </div>
                <div className="form-group">
                  <textarea className="form-textarea" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Giới thiệu bản thân" />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary btn-sm" onClick={handleSave}>💾 Lưu</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}>Hủy</button>
                </div>
              </div>
            ) : (
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{profile.display_name}</h2>
                <p style={{ color: 'var(--text-secondary)' }}>@{profile.username}</p>
                {profile.bio && <p style={{ marginTop: 8 }}>{profile.bio}</p>}
                {isOwnProfile && <button className="btn btn-secondary btn-sm" style={{ marginTop: 12 }} onClick={() => setEditing(true)}>✏️ Chỉnh sửa</button>}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--accent-light)' }}>🎮</div>
          <div className="stat-info"><h3>{profile.stats?.totalGames || 0}</h3><p>Trò chơi</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-light)' }}>🏆</div>
          <div className="stat-info"><h3>{profile.stats?.wins || 0}</h3><p>Chiến thắng</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--warning-light)' }}>⭐</div>
          <div className="stat-info"><h3>{profile.stats?.achievements || 0}</h3><p>Thành tựu</p></div>
        </div>
      </div>

      {isOwnProfile && scores.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>📊 Lịch sử chơi gần đây</h3>
          <table className="data-table">
            <thead><tr><th>Game</th><th>Điểm</th><th>Kết quả</th><th>Thời gian</th></tr></thead>
            <tbody>
              {scores.slice(0, 10).map(s => (
                <tr key={s.id}>
                  <td>{s.game_slug}</td>
                  <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{s.score}</td>
                  <td><span className={`badge badge-${s.result === 'win' ? 'success' : s.result === 'lose' ? 'danger' : 'warning'}`}>{s.result}</span></td>
                  <td>{new Date(s.created_at).toLocaleString('vi')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
