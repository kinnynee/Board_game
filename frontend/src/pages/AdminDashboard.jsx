import { useState } from 'react';

export default function AdminDashboard() {
  // Hardcoded data (Ngu - Dumb level)
  const stats = {
    totalUsers: 100,
    activeUsers: 80,
    totalGamesPlayed: 500,
    totalMessages: 1200,
    gameStats: [
      { game_slug: 'caro', total_plays: 250, avg_score: 15 },
      { game_slug: 'chess', total_plays: 150, avg_score: 30 },
      { game_slug: 'minesweeper', total_plays: 100, avg_score: 5 }
    ],
    recentUsers: [
      { id: 1, display_name: 'Khai Admin', created_at: '2026-03-31' },
      { id: 2, display_name: 'Người mới', created_at: '2026-03-30' }
    ]
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>Admin Dashboard (Draft)</h1>
      <p>This is a draft version of the admin dashboard with static data.</p>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: '#f0f0f0', padding: '15px', borderRadius: '8px', border: '1px solid #ddd', flex: 1 }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>Total Users</p>
          <h2 style={{ margin: 0 }}>{stats.totalUsers}</h2>
        </div>
        <div style={{ background: '#f0f0f0', padding: '15px', borderRadius: '8px', border: '1px solid #ddd', flex: 1 }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>Active Users</p>
          <h2 style={{ margin: 0 }}>{stats.activeUsers}</h2>
        </div>
        <div style={{ background: '#f0f0f0', padding: '15px', borderRadius: '8px', border: '1px solid #ddd', flex: 1 }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>Games Played</p>
          <h2 style={{ margin: 0 }}>{stats.totalGamesPlayed}</h2>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '30px' }}>
        <div style={{ flex: 1 }}>
          <h3>Game Statistics</h3>
          <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#eee' }}>
                <th>Game</th>
                <th>Plays</th>
                <th>Avg Score</th>
              </tr>
            </thead>
            <tbody>
              {stats.gameStats.map((g, i) => (
                <tr key={i}>
                  <td>{g.game_slug}</td>
                  <td>{g.total_plays}</td>
                  <td>{g.avg_score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ flex: 1 }}>
          <h3>Recent Users</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {stats.recentUsers.map(u => (
              <li key={u.id} style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
                {u.display_name} - {u.created_at}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
