import { useState, useEffect } from 'react';
import api from '../api';

export default function AchievementsPage({ onBack }) {
  const [achievements, setAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/achievements')
      .then((res) => {
        setAchievements(res.data.data);
      })
      .catch(() => {
        setError('Không thể tải danh sách thành tựu. Vui lòng thử lại.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <button className="btn-back" onClick={onBack}>← Quay lại</button>
        <h1>🏆 Thành Tựu</h1>
        <p>Theo dõi các thành tựu bạn đã đạt được trong quá trình chơi</p>
      </div>

      {isLoading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Đang tải thành tựu...</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <p>⚠️ {error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <>
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
        </>
      )}
    </div>
  );
}
