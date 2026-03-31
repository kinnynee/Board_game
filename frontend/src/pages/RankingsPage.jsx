import { useState } from 'react';

// Lần 1: Dữ liệu bảng xếp hạng tĩnh (fake data) - chưa kết nối API
const FAKE_RANKINGS = [
  { rank: 1, username: 'ProGamer_VN', score: 4850, wins: 48, losses: 5 },
  { rank: 2, username: 'ChessKing99', score: 4200, wins: 42, losses: 10 },
  { rank: 3, username: 'BoardMaster', score: 3900, wins: 39, losses: 12 },
  { rank: 4, username: 'LuckyStreak', score: 3400, wins: 34, losses: 18 },
  { rank: 5, username: 'QuietStorm', score: 3100, wins: 31, losses: 20 },
  { rank: 6, username: 'ThunderBolt', score: 2800, wins: 28, losses: 22 },
  { rank: 7, username: 'Strategist01', score: 2500, wins: 25, losses: 25 },
  { rank: 8, username: 'NightOwl_VN', score: 2200, wins: 22, losses: 28 },
  { rank: 9, username: 'Rookie123', score: 1900, wins: 19, losses: 31 },
  { rank: 10, username: 'NewPlayer007', score: 1500, wins: 15, losses: 35 },
];

const RANK_MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function RankingsPage({ onBack }) {
  const [rankings] = useState(FAKE_RANKINGS);

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
