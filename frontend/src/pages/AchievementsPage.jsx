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
        setError('Hệ thống đang bảo trì, không thể tải danh sách thành tựu lúc này.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <div className="page-header" style={{ marginBottom: '30px', textAlign: 'center' }}>
        <button className="btn-back" onClick={onBack} style={{ position: 'absolute', left: '20px', padding: '8px 16px', cursor: 'pointer', background: '#333', color: 'white', border: 'none', borderRadius: '4px' }}>← Quay lại</button>
        <h1 style={{ color: '#FFD700', fontSize: '2.5rem', margin: '10px 0' }}>🏆 Bộ Sưu Tập Thành Tựu</h1>
        <p style={{ color: '#aaa', fontSize: '1.1rem' }}>Vinh danh những nỗ lực và tài năng của bạn qua từng ván đấu</p>
      </div>

      {isLoading && (
        <div className="loading-state" style={{ textAlign: 'center', padding: '50px' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: '#e94560', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
          <p style={{ marginTop: '15px', color: '#888' }}>Đang mở rương kho báu...</p>
        </div>
      )}

      {error && (
        <div className="error-state" style={{ color: '#ff6b6b', padding: '20px', backgroundColor: 'rgba(255,0,0,0.1)', borderRadius: '8px', textAlign: 'center' }}>
          <p>⚠️ {error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <>
          <div className="achievements-stats" style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
            <div style={{ background: 'linear-gradient(45deg, #0f3460, #16213e)', padding: '15px 30px', borderRadius: '50px', border: '1px solid #e94560', boxShadow: '0 0 15px rgba(233, 69, 96, 0.3)' }}>
              <span style={{ fontSize: '1.2rem', color: 'white', fontWeight: 'bold' }}>
                Tiến độ mở khóa: <span style={{ color: '#FFD700' }}>{achievements.filter(a => a.unlocked).length}</span> / {achievements.length}
              </span>
            </div>
          </div>

          <div className="achievements-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {achievements.map((achievement) => (
              <div 
                key={achievement.id} 
                className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                style={{ 
                  background: achievement.unlocked ? 'linear-gradient(135deg, #1a1a2e, #16213e)' : '#111',
                  border: achievement.unlocked ? '1px solid #e94560' : '1px solid #333',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  opacity: achievement.unlocked ? 1 : 0.6,
                  filter: achievement.unlocked ? 'none' : 'grayscale(100%)',
                  transition: 'transform 0.2s',
                  cursor: achievement.unlocked ? 'pointer' : 'default',
                  boxShadow: achievement.unlocked ? '0 4px 10px rgba(0,0,0,0.3)' : 'none'
                }}
              >
                <div className="achievement-icon" style={{ fontSize: '3rem', textShadow: achievement.unlocked ? '0 0 15px rgba(255, 215, 0, 0.5)' : 'none' }}>
                  {achievement.icon}
                </div>
                <div className="achievement-info" style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 5px 0', color: achievement.unlocked ? '#fff' : '#888', fontSize: '1.1rem' }}>{achievement.title}</h3>
                  <p style={{ margin: 0, color: '#aaa', fontSize: '0.9rem' }}>{achievement.description}</p>
                </div>
                <div className="achievement-status" style={{ fontSize: '1.5rem' }}>
                  {achievement.unlocked ? '🌟' : '🔒'}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
