import { useState, useEffect } from 'react';
import { api } from '../api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.adminGetStatistics().then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  if (!stats) return <div className="empty-state"><p>Không thể tải thống kê</p></div>;

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>📊 Thống kê hệ thống</h1>
        <p>Tổng quan về hoạt động của hệ thống</p>
      </div>

      <div className="card-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--accent-light)' }}>👥</div>
          <div className="stat-info"><h3>{stats.totalUsers}</h3><p>Tổng người dùng</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-light)' }}>✅</div>
          <div className="stat-info"><h3>{stats.activeUsers}</h3><p>Đang hoạt động</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--warning-light)' }}>🎮</div>
          <div className="stat-info"><h3>{stats.totalGamesPlayed}</h3><p>Lượt chơi</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--danger-light)' }}>💬</div>
          <div className="stat-info"><h3>{stats.totalMessages}</h3><p>Tin nhắn</p></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>🎯 Thống kê theo game</h3>
          <table className="data-table">
            <thead><tr><th>Game</th><th>Lượt chơi</th><th>Điểm TB</th></tr></thead>
            <tbody>
              {stats.gameStats.map((g, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{g.game_slug}</td>
                  <td>{g.total_plays}</td>
                  <td style={{ color: 'var(--accent)' }}>{g.avg_score ? Math.round(g.avg_score) : 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 16 }}>👤 Người dùng mới</h3>
          {stats.recentUsers.map(u => (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
              <div className="avatar avatar-sm">{u.display_name?.[0] || '?'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.display_name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(u.created_at).toLocaleDateString('vi')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
