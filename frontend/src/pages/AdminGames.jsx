import { useState, useEffect } from 'react';
import { api } from '../api';
import './Admin.css';

export default function AdminGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadGames(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const loadGames = (search = '') => {
    setLoading(true);
    api.adminGetGames(search)
      .then(setGames)
      .catch(err => showToast('Lỗi: ' + err.message))
      .finally(() => setLoading(false));
  };

  const handleToggleGame = async () => {
    if (!confirmModal) return;
    const { game } = confirmModal;
    try {
      await api.adminUpdateGame(game.id, { enabled: game.enabled ? 0 : 1 });
      showToast(`Đã ${game.enabled ? 'tắt' : 'bật'} game ${game.name} thành công!`);
      loadGames(searchTerm);
    } catch (err) {
      showToast('Lỗi: ' + err.message);
    } finally {
      setConfirmModal(null);
    }
  };

  const getGamePoster = (slug) => {
    // Mapping posters to slugs (Phase 3 Pro)
    const posters = {
      'caro': 'https://placehold.co/400x200/6366f1/ffffff?text=Caro+Master',
      'chess': 'https://placehold.co/400x200/1e293b/ffffff?text=Chess+Pro',
      'minesweeper': 'https://placehold.co/400x200/ef4444/ffffff?text=Minesweeper'
    };
    return posters[slug] || 'https://placehold.co/400x225/e2e8f0/64748b?text=Game+Poster';
  };

  if (loading && searchTerm === '') return <div className="admin-container">Đang tải danh mục game Pro...</div>;

  return (
    <div className="admin-container">
      {/* Toast Notification */}
      {toast && (
        <div className="toast-container">
          <div className="toast">🚀 {toast}</div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Thay đổi trạng thái Game</h3>
            <p>Bạn có chắc chắn muốn <strong>{confirmModal.game.enabled ? 'TẮT' : 'BẬT'}</strong> trò chơi <strong>{confirmModal.game.name}</strong> không?</p>
            <div className="modal-actions">
              <button className="btn-pro btn-outline" onClick={() => setConfirmModal(null)}>Hủy</button>
              <button className="btn-pro btn-primary" onClick={handleToggleGame}>Xác nhận</button>
            </div>
          </div>
        </div>
      )}

      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.875rem', fontWeight: 700 }}>Danh mục trò chơi</h1>
        <p style={{ color: '#64748b' }}>Quản lý trạng thái và cấu hình các trò chơi trên nền tảng.</p>
      </header>

      <input 
        type="text" 
        placeholder="Tìm kiếm trò chơi..." 
        className="search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: '2rem' }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
        {games.map(g => (
          <div key={g.id} className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
              <img 
                src={getGamePoster(g.slug)} 
                alt={g.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
              <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                <span className={`badge ${g.enabled ? 'badge-success' : 'badge-danger'}`}>
                  {g.enabled ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>
            </div>
            
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0 }}>{g.name}</h3>
                  <code style={{ fontSize: '0.75rem', color: '#6366f1' }}>{g.slug}</code>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Kích thước</div>
                  <div style={{ fontWeight: 600 }}>{g.board_width} x {g.board_height}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  className={`btn-pro ${g.enabled ? 'btn-outline' : 'btn-primary'}`}
                  style={{ flex: 1 }}
                  onClick={() => setConfirmModal({ game: g })}
                >
                  {g.enabled ? 'Tắt hệ thống' : 'Bật hệ thống'}
                </button>
                <button className="btn-pro btn-outline" style={{ flex: 1 }}>Cấu hình</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <input 
        type="text" 
        placeholder="Tìm kiếm trò chơi..." 
        className="search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: '2rem' }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
        {games.map(g => (
          <div key={g.id} className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
              <img 
                src={getGamePoster(g.slug)} 
                alt={g.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
              <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                <span className={`badge ${g.enabled ? 'badge-success' : 'badge-danger'}`}>
                  {g.enabled ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>
            </div>
            
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0 }}>{g.name}</h3>
                  <code style={{ fontSize: '0.75rem', color: '#6366f1' }}>{g.slug}</code>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Kích thước</div>
                  <div style={{ fontWeight: 600 }}>{g.board_width} x {g.board_height}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  className={`btn-pro ${g.enabled ? 'btn-outline' : 'btn-primary'}`}
                  style={{ flex: 1 }}
                  onClick={() => toggleEnabled(g)}
                >
                  {g.enabled ? 'Tắt hệ thống' : 'Bật hệ thống'}
                </button>
                <button className="btn-pro btn-outline" style={{ flex: 1 }}>Cấu hình</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {games.length === 0 && !loading && (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
            <p style={{ color: '#64748b' }}>Không tìm thấy trò chơi nào khớp với từ khóa "{searchTerm}".</p>
        </div>
      )}
    </div>
  );
}
