import { useEffect, useState } from 'react';
import { api } from '../api';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [scores, setScores] = useState([]);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    // Gọi rời rạc, chưa tối ưu hiệu năng
    api.getOwnProfile().then(setProfile);
    api.getMyScores().then(setScores);
  }, []);

  if (!profile) return <div>Đang tải...</div>;

  return (
    <div className="profile-container">
      <div className="user-info">
        <h1>{profile.display_name}</h1>
        <p>Email: {profile.email}</p>
        <button onClick={() => setEditing(true)}>Chỉnh sửa</button>
      </div>
      
      <div className="user-scores">
        <h3>Lịch sử đấu:</h3>
        {scores.map(s => <p key={s.id}>{s.game_name}: {s.score} điểm</p>)}
      </div>
    </div>
  );
}