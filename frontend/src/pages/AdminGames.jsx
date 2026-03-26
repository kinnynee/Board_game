import { useState, useEffect } from 'react';
import { api } from '../api';

export default function AdminGames() {
  const [games, setGames] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = () => {
    api.adminGetGames().then(setGames).catch(console.error).finally(() => setLoading(false));
  };

  const startEdit = (game) => {
    setEditing(game.id);
    setForm({ name: game.name, board_width: game.board_width, board_height: game.board_height, description: game.description || '', instructions: game.instructions || '' });
  };

  const handleSave = async () => {
    try {
      await api.adminUpdateGame(editing, form);
      setEditing(null);
      loadGames();
    } catch (err) { alert(err.message); }
  };

  const toggleEnabled = async (game) => {
    try {
      await api.adminUpdateGame(game.id, { enabled: game.enabled ? 0 : 1 });
      loadGames();
    } catch (err) { alert(err.message); }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>🎯 Quản lý Game</h1>
        <p>Tùy chỉnh kích thước bàn game, bật/tắt trò chơi</p>
      </div>

      <div className="card-grid">
        {games.map(g => (
          <div key={g.id} className="card">
            {editing === g.id ? (
              <div>
                <div className="form-group">
                  <label className="form-label">Tên game</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Chiều rộng</label>
                    <input className="form-input" type="number" value={form.board_width} onChange={e => setForm({ ...form, board_width: parseInt(e.target.value) })} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Chiều cao</label>
                    <input className="form-input" type="number" value={form.board_height} onChange={e => setForm({ ...form, board_height: parseInt(e.target.value) })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Mô tả</label>
                  <textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary btn-sm" onClick={handleSave}>💾 Lưu</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setEditing(null)}>Hủy</button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h3 style={{ fontWeight: 700 }}>{g.name}</h3>
                  <span className={`badge ${g.enabled ? 'badge-success' : 'badge-danger'}`}>{g.enabled ? 'Bật' : 'Tắt'}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8 }}>{g.description}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12 }}>Bàn: {g.board_width}×{g.board_height} | Slug: {g.slug}</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => startEdit(g)}>✏️ Sửa</button>
                  <button className={`btn btn-sm ${g.enabled ? 'btn-danger' : 'btn-success'}`} onClick={() => toggleEnabled(g)}>
                    {g.enabled ? '🔒 Tắt' : '🔓 Bật'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
