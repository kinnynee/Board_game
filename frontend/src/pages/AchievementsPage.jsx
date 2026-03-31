import { useState, useEffect } from 'react';
import api from '../api';

export default function AchievementsPage({ onBack }) {
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    api.get('/achievements').then((res) => {
      setAchievements(res.data.data);
    });
  }, []);

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
