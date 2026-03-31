import { useState, useEffect } from 'react';
import api from '../api';

const RANK_MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function RankingsPage({ onBack }) {
  const [rankings, setRankings] = useState([]);

  useEffect(() => {
    api.get('/rankings').then((res) => {
      setRankings(res.data.data);
    });
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <button className="btn-back" onClick={onBack}>← Quay lại</button>
        <h1>🏆 Bảng Xếp Hạng</h1>
        <p>Top người chơi xuất sắc nhất</p>
      </div>

      <div className="rankings-table-wrapper">
        <table className="rankings-table">
          <thead>
            <tr>
              <th>Hạng</th>
              <th>Tên người chơi</th>
              <th>Điểm số</th>
              <th>Thắng</th>
              <th>Thua</th>
            </tr>
          </thead>
          <tbody>
            {rankings.map((player) => (
              <tr key={player.rank} className={player.rank <= 3 ? 'top-rank' : ''}>
                <td className="rank-cell">
                  {RANK_MEDALS[player.rank] || `#${player.rank}`}
                </td>
                <td className="username-cell">{player.username}</td>
                <td className="score-cell">{player.score.toLocaleString()}</td>
                <td className="wins-cell">✅ {player.wins}</td>
                <td className="losses-cell">❌ {player.losses}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
