import { useState } from 'react';

// Lần 1: Dữ liệu thành tựu tĩnh (fake data) - chưa kết nối API
const FAKE_ACHIEVEMENTS = [
  { id: 1, title: 'Người mới bắt đầu', description: 'Chơi ván đấu đầu tiên', icon: '🏅', unlocked: true },
  { id: 2, title: 'Chiến thắng đầu tiên', description: 'Thắng 1 ván đấu', icon: '🥇', unlocked: true },
  { id: 3, title: 'Chuỗi chiến thắng', description: 'Thắng 5 ván liên tiếp', icon: '🔥', unlocked: false },
  { id: 4, title: 'Kẻ chinh phục', description: 'Thắng 20 ván đấu', icon: '👑', unlocked: false },
  { id: 5, title: 'Bậc thầy chiến thuật', description: 'Thắng 50 ván đấu', icon: '🏆', unlocked: false },
];

export default function AchievementsPage({ onBack }) {
  const [achievements] = useState(FAKE_ACHIEVEMENTS);

  return (
    <div className="page-container">
      <div className="page-header">
        <button className="btn-back" onClick={onBack}>← Quay lại</button>
        <h1>🏆 Thành Tựu</h1>
        <p>Theo dõi các thành tựu bạn đã đạt được trong quá trình chơi</p>
      </div>

      <div className="achievements-stats">
        <span>Đã mở khóa: {achievements.filter(a => a.unlocked).length}/{achievements.length}</span>
      </div>

      <div className="achievements-grid">
        {achievements.map((achievement) => (
          <div key={achievement.id} className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}>
            <div className="achievement-icon">{achievement.icon}</div>
            <div className="achievement-info">
              <h3>{achievement.title}</h3>
              <p>{achievement.description}</p>
            </div>
            <div className="achievement-status">
              {achievement.unlocked ? '✅' : '🔒'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
