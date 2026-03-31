import { useState, useEffect } from 'react';
import { api } from '../api';
import './Admin.css';

const UserGrowthChart = ({ recentUsers }) => {
  // Simple SVG Line Chart (Phase 3 Pro)
  const data = recentUsers?.length > 0 ? recentUsers.slice().reverse() : [];
  const points = data.map((u, i) => `${i * 80 + 20},${100 - (i * 15 + 10)}`).join(' ');
  
  return (
    <svg width="100%" height="150" style={{ marginTop: '20px' }}>
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M ${points}`} fill="none" stroke="#6366f1" strokeWidth="3" />
      <path d={`M 20,150 L ${points} L ${data.length * 80},150 Z`} fill="url(#gradient)" />
      {data.map((u, i) => (
        <circle key={i} cx={i * 80 + 20} cy={100 - (i * 15 + 10)} r="4" fill="#fff" stroke="#6366f1" strokeWidth="2" />
      ))}
    </svg>
  );
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.adminGetStatistics()
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="admin-container" style={{ textAlign: 'center' }}>
      <div className="spinner"></div>
      <p style={{ marginTop: '20px', color: '#64748b' }}>Đang chuẩn bị bảng điều khiển Pro...</p>
    </div>
  );

  return (
    <div className="admin-container">
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.875rem', fontWeight: 700 }}>Hệ thống quản trị</h1>
        <p style={{ color: '#64748b', margin: 0 }}>Chào mừng trở lại! Đây là tổng quan mạng lưới của bạn.</p>
      </header>
      
      <div className="stats-grid">
        <div className="glass-card">
          <div style={{ color: '#6366f1', marginBottom: '0.5rem' }}>👥 Tổng người dùng</div>
          <h2 style={{ margin: 0 }}>{stats.totalUsers}</h2>
        </div>
        <div className="glass-card">
          <div style={{ color: '#8b5cf6', marginBottom: '0.5rem' }}>🟢 Đang hoạt động</div>
          <h2 style={{ margin: 0 }}>{stats.activeUsers}</h2>
        </div>
        <div className="glass-card">
          <div style={{ color: '#f59e0b', marginBottom: '0.5rem' }}>🎮 Lượt chơi game</div>
          <h2 style={{ margin: 0 }}>{stats.totalGamesPlayed}</h2>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        <div className="glass-card">
          <h3>📈 Tăng trưởng người dùng</h3>
          <UserGrowthChart recentUsers={stats.recentUsers} />
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.8rem', marginTop: '10px' }}>
            <span>Trước đó</span>
            <span>Hôm nay</span>
          </div>
        </div>

        <div className="glass-card">
          <h3>📊 Hiệu suất trò chơi</h3>
          <table className="pro-table">
            <thead>
              <tr>
                <th>Game Slug</th>
                <th>Lượt chơi</th>
              </tr>
            </thead>
            <tbody>
              {stats.gameStats?.slice(0, 5).map((g, i) => (
                <tr key={i}>
                  <td><code>{g.game_slug}</code></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: `${(g.total_plays / stats.totalGamesPlayed) * 100}%`, height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', flex: 1 }}>
                        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #6366f1, #a855f7)' }}></div>
                      </div>
                      <span>{g.total_plays}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
