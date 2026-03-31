import { useState, useEffect } from 'react';
import { api } from '../api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Gọi API thật từ Backend (Phase 2)
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
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <div className="spinner"></div>
      <p>Đang tải dữ liệu hệ thống...</p>
    </div>
  );

  if (!stats) return <div style={{ padding: '20px' }}>Không thể tải thống kê.</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ borderBottom: '2px solid var(--accent)', paddingBottom: '10px' }}>📊 Thống kê hệ thống</h1>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div className="card" style={{ flex: 1, textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#666' }}>Tổng người dùng</p>
          <h2 style={{ margin: '10px 0' }}>{stats.totalUsers}</h2>
        </div>
        <div className="card" style={{ flex: 1, textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#666' }}>Đang hoạt động</p>
          <h2 style={{ margin: '10px 0' }}>{stats.activeUsers}</h2>
        </div>
        <div className="card" style={{ flex: 1, textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#666' }}>Lượt chơi game</p>
          <h2 style={{ margin: '10px 0' }}>{stats.totalGamesPlayed}</h2>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        <div className="card">
          <h3>🎯 Thống kê theo game</h3>
          <table border="0" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                <th style={{ padding: '10px' }}>Game</th>
                <th style={{ padding: '10px' }}>Lượt chơi</th>
              </tr>
            </thead>
            <tbody>
              {stats.gameStats?.map((g, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}>{g.game_slug}</td>
                  <td style={{ padding: '10px' }}>{g.total_plays}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3>👤 Người dùng mới</h3>
          {stats.recentUsers?.map(u => (
            <div key={u.id} style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
              <strong>{u.display_name}</strong> - <span style={{ fontSize: '0.8rem', color: '#999' }}>{new Date(u.created_at).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
