import { useState, useEffect } from 'react';
import { api } from '../api';

export default function AdminGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = () => {
    setLoading(true);
    api.adminGetGames()
      .then(setGames)
      .catch(err => alert('Lỗi tải danh sách game: ' + err.message))
      .finally(() => setLoading(false));
  };

  const toggleEnabled = async (game) => {
    try {
      await api.adminUpdateGame(game.id, { enabled: game.enabled ? 0 : 1 });
      loadGames();
    } catch (err) { alert(err.message); }
  };

  if (loading) return <div style={{ padding: '20px' }}>Đang tải danh sách game...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>🎯 Quản lý Game</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {games.map(g => (
          <div key={g.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>{g.name}</h3>
            <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#666' }}>Slug: <code>{g.slug}</code></p>
            <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>Kích thước: {g.board_width}x{g.board_height}</p>
            <div style={{ margin: '15px 0' }}>
              <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', background: g.enabled ? '#d4edda' : '#f8d7da', color: g.enabled ? '#155724' : '#721c24' }}>
                {g.enabled ? 'Đang bật' : 'Đang tắt'}
              </span>
            </div>
            <button 
              onClick={() => toggleEnabled(g)}
              style={{ width: '100%', padding: '8px', cursor: 'pointer', background: g.enabled ? '#f8d7da' : '#d4edda', border: '1px solid #ccc', borderRadius: '4px' }}
            >
              {g.enabled ? 'Tắt game' : 'Bật game'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
