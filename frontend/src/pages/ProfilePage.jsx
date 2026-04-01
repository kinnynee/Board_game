import {
  Description,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';

function formatDate(value) {
  return new Date(value).toLocaleDateString('vi-VN');
}

function formatDuration(seconds = 0) {
  const totalSeconds = Number(seconds) || 0;
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const remainingSeconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
}

export default function ProfilePage() {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [recentScores, setRecentScores] = useState([]);
  const [form, setForm] = useState({ display_name: '', email: '', bio: '' });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError('');

      try {
        const [nextProfile, nextScores] = await Promise.all([
          api.getOwnProfile(),
          api.getMyScores(8),
        ]);

        if (cancelled) {
          return;
        }

        setProfile(nextProfile);
        setRecentScores(nextScores);
        setForm({
          display_name: nextProfile.display_name || '',
          email: nextProfile.email || '',
          bio: nextProfile.bio || '',
        });
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');

    try {
      const updatedProfile = await api.updateProfile(form);
      setProfile(updatedProfile);
      updateUser(updatedProfile);
      setEditing(false);
      setNotice('Cập nhật profile thành công.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="content-panel">
        <div className="page-loader">
          <div className="spinner" />
          <p>Đang tải thông tin profile...</p>
        </div>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="content-panel">
        <div className="empty-state">
          <h2>Không tải được profile</h2>
          <p>{error || 'Không có dữ liệu để hiển thị.'}</p>
        </div>
      </section>
    );
  }

  return (
    <div className="page-stack">
      <section className="profile-hero">
        <div className="avatar avatar-xl">{profile.display_name?.slice(0, 1) || '?'}</div>
        <div className="profile-hero-copy">
          <p className="section-tag">Profile</p>
          <h1>{profile.display_name}</h1>
          <p className="profile-meta">@{profile.username}</p>
          <p className="profile-meta">Tham gia ngày {formatDate(profile.created_at)}</p>
        </div>
        <div className="profile-hero-actions">
          <button className="btn btn-secondary" type="button" onClick={() => setEditing((prev) => !prev)}>
            {editing ? 'Đóng form' : 'Chỉnh sửa profile'}
          </button>
          <span className="hero-chip">{profile.is_active ? 'Tài khoản đang hoạt động' : 'Tài khoản tạm khóa'}</span>
        </div>
      </section>

      <div className="stats-strip">
        <article className="stat-tile">
          <span className="stat-label">Vai trò</span>
          <strong>{profile.role}</strong>
        </article>
        <article className="stat-tile">
          <span className="stat-label">Trạng thái</span>
          <strong>{profile.is_active ? 'Đang hoạt động' : 'Đã khóa'}</strong>
        </article>
        <article className="stat-tile">
          <span className="stat-label">Lượt chơi</span>
          <strong>{profile.stats?.total_games || 0}</strong>
        </article>
        <article className="stat-tile">
          <span className="stat-label">Điểm trung bình</span>
          <strong>{profile.stats?.average_score ? profile.stats.average_score.toFixed(1) : '0.0'}</strong>
        </article>
        <article className="stat-tile">
          <span className="stat-label">Đánh giá đã gửi</span>
          <strong>{profile.stats?.ratings_given || 0}</strong>
        </article>
      </div>

      {notice && <div className="alert alert-success">{notice}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="profile-grid">
        <article className="profile-card">
          <div className="panel-heading">
            <div>
              <p className="section-tag">Thông tin</p>
              <h2>Thông tin cá nhân</h2>
            </div>
          </div>

          <div className="info-list">
            <div>
              <span>Username</span>
              <strong>@{profile.username}</strong>
            </div>
            <div>
              <span>Email</span>
              <strong>{profile.email}</strong>
            </div>
            <div>
              <span>Bio</span>
              <strong>{profile.bio || 'Bạn chưa cập nhật giới thiệu.'}</strong>
            </div>
            <div>
              <span>Cập nhật lần cuối</span>
              <strong>{formatDate(profile.updated_at)}</strong>
            </div>
          </div>

          <div className="profile-note">
            <strong>Tóm tắt nhanh</strong>
            <p>
              Profile này hiện đang dùng cho luồng auth và cập nhật thông tin. Mọi thay đổi sẽ được phản ánh ngay lên
              session hiện tại sau khi lưu thành công.
            </p>
          </div>
        </article>

        <article className="profile-card">
          <div className="panel-heading">
            <div>
              <p className="section-tag">Cập nhật</p>
              <h2>Chỉnh sửa profile</h2>
            </div>
          </div>

          <div className="empty-state empty-state-left">
            <p>Mở hộp thoại chỉnh sửa để cập nhật tên hiển thị, email và bio của bạn trong một luồng tập trung hơn.</p>
            <button className="btn btn-primary" type="button" onClick={() => setEditing(true)}>
              Mở hộp thoại chỉnh sửa
            </button>
          </div>
        </article>
      </div>

      <section className="content-panel">
        <div className="panel-heading">
          <div>
            <p className="section-tag">Game History</p>
            <h2>Điểm số gần đây</h2>
          </div>
        </div>

        <p className="card-copy">
          Đây là 8 bản ghi gần nhất được trả về từ backend, giúp bạn nhìn nhanh kết quả và thời lượng mỗi ván chơi.
        </p>

        {recentScores.length ? (
          <div className="score-list">
            {recentScores.map((score) => (
              <div key={score.id} className="score-row">
                <div>
                  <strong>{score.game_name}</strong>
                  <p>{formatDate(score.created_at)}</p>
                </div>
                <div className="score-row-meta">
                  <strong>{score.score}</strong>
                  <span>{score.result}</span>
                  <span>{formatDuration(score.duration_seconds)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state empty-state-left">
            <p>Chưa có điểm số nào. Sau khi chơi game và lưu kết quả, lịch sử sẽ hiện ở đây.</p>
          </div>
        )}
      </section>

      <Dialog open={editing} onClose={setEditing} className="dialog-root">
        <DialogBackdrop className="dialog-backdrop" />
        <div className="dialog-frame">
          <DialogPanel className="dialog-panel">
            <div className="dialog-header">
              <div>
                <p className="section-tag">Headless UI Dialog</p>
                <DialogTitle as="h2">Chỉnh sửa profile</DialogTitle>
                <Description className="card-copy">
                  Mọi thay đổi sẽ được lưu trực tiếp vào tài khoản hiện tại và đồng bộ lại phần thông tin phía ngoài.
                </Description>
              </div>
            </div>

            <form className="auth-form" onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label" htmlFor="profile-display-name">Display name</label>
                <input
                  id="profile-display-name"
                  className="form-input"
                  value={form.display_name}
                  onChange={(event) => setForm((prev) => ({ ...prev, display_name: event.target.value }))}
                  placeholder="Nhập tên hiển thị"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="profile-email">Email</label>
                <input
                  id="profile-email"
                  className="form-input"
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="email@example.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="profile-bio">Bio</label>
                <textarea
                  id="profile-bio"
                  className="form-textarea"
                  rows={5}
                  value={form.bio}
                  onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))}
                  placeholder="Giới thiệu ngắn gọn về bản thân"
                />
              </div>

              <div className="button-row">
                <button className="btn btn-primary" type="submit" disabled={saving}>
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
                <button className="btn btn-secondary" type="button" onClick={() => setEditing(false)}>
                  Hủy
                </button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
}
