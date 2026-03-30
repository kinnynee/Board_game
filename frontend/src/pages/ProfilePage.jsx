import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';

export default function ProfilePage() {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [recentScores, setRecentScores] = useState([]);
  
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    // Gọi API 
    api.getOwnProfile().then(data => {
      setProfile(data);
      setDisplayName(data.display_name || '');
      setBio(data.bio || '');
    });

    api.getMyScores().then(data => {
      setRecentScores(data);
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      // Cập nhật thông qua API
      const updated = await api.updateProfile({ display_name: displayName, bio: bio });
      setProfile(updated);
      updateUser(updated);
      alert('Cập nhật thành công!');
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  if (!profile) return <div>Đang tải dữ liệu...</div>;

  return (
    <div className="profile-page">
      <h1>Hồ sơ của {profile.username}</h1>
      
      <section>
        <h2>Thông tin cá nhân</h2>
        <form onSubmit={handleSave}>
          <input 
            value={displayName} 
            onChange={e => setDisplayName(e.target.value)} 
            placeholder="Tên hiển thị" 
          />
          <textarea 
            value={bio} 
            onChange={e => setBio(e.target.value)} 
            placeholder="Giới thiệu"
          />
          <button type="submit">Lưu thay đổi</button>
        </form>
      </section>

      <section>
        <h2>Lịch sử điểm số</h2>
        <ul>
          {recentScores.map(score => (
            <li key={score.id}>
              Game: {score.game_name} - Điểm: {score.score}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}