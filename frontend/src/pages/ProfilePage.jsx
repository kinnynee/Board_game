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
  if (!value) {
    return 'Chưa cập nhật';
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Chưa cập nhật';
  }

  return parsedDate.toLocaleDateString('vi-VN');
}

function formatDuration(seconds = 0) {
  const totalSeconds = Number(seconds) || 0;
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const remainingSeconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
}

function createProfileForm(profile) {
  return {
    display_name: profile?.display_name || '',
    email: profile?.email || '',
    bio: profile?.bio || '',
  };
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
  const displayName = profile?.display_name || profile?.username || 'Người dùng';
  const canSave = Boolean(form.display_name.trim()) && Boolean(form.email.trim()) && !saving;

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
        setForm(createProfileForm(nextProfile));
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

  function openEditor() {
    setForm(createProfileForm(profile));
    setError('');
    setNotice('');
    setEditing(true);
  }

  function closeEditor() {
    setForm(createProfileForm(profile));
    setError('');
    setEditing(false);
  }

  function updateField(field) {
    return (event) => {
      const value = field === 'bio' ? event.target.value : event.target.value.trimStart();
      setForm((prev) => ({ ...prev, [field]: value }));
      if (error) {
        setError('');
      }
    };
  }

  async function handleSave(event) {
    event.preventDefault();
    setError('');
    setNotice('');

    const payload = {
      display_name: form.display_name.trim(),
      email: form.email.trim().toLowerCase(),
      bio: form.bio.trim(),
    };

    if (!payload.display_name) {
      setError('Display name không được để trống.');
      return;
    }

    if (!payload.email) {
      setError('Email không được để trống.');
      return;
    }

    if (payload.bio.length > 160) {
      setError('Bio nên ngắn gọn trong khoảng 160 ký tự.');
      return;
    }

    setSaving(true);

    try {
      const updatedProfile = await api.updateProfile(payload);
      setProfile(updatedProfile);
      setForm(createProfileForm(updatedProfile));
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
        <div className="avatar avatar-xl">{displayName.slice(0, 1).toUpperCase() || '?'}</div>
        <div className="profile-hero-copy">
          <p className="section-tag">Profile</p>
          <h1>{displayName}</h1>
          <p className="profile-meta">@{profile.username}</p>
          <p className="profile-meta">Tham gia ngày {formatDate(profile.created_at)}</p>
        </div>
        <div className="profile-hero-actions">
          <button className="btn btn-secondary" type="button" onClick={openEditor}>
            Chỉnh sửa profile
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

        
        </article>

        <article className="profile-card">
          <div className="panel-heading">
            <div>
              <p className="section-tag">Cập nhật</p>
              <h2>Chỉnh sửa profile</h2>
            </div>
          </div>

          <div className="empty-state empty-state-left">
            <p>Hộp thoại chỉnh sửa sẽ giúp bạn cập nhật tên hiển thị, email và bio trong một luồng gọn hơn.</p>
            <button className="btn btn-primary" type="button" onClick={openEditor}>
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

      <Dialog open={editing} onClose={closeEditor} className="dialog-root">
        <DialogBackdrop className="dialog-backdrop" />
        <div className="dialog-frame">
          <DialogPanel className="dialog-panel">
            <div className="dialog-header">
              <div>
                <p className="section-tag">Headless UI Dialog</p>
                <DialogTitle as="h2">Chỉnh sửa profile</DialogTitle>
                <Description className="card-copy">
                  Mọi thay đổi sẽ được lưu trực tiếp vào tài khoản hiện tại và đồng bộ lại phần thông tin bên ngoài.
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
                  onChange={updateField('display_name')}
                  placeholder="Nhập tên hiển thị"
                  maxLength={50}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="profile-email">Email</label>
                <input
                  id="profile-email"
                  className="form-input"
                  type="email"
                  value={form.email}
                  onChange={updateField('email')}
                  placeholder="email@example.com"
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="profile-bio">Bio</label>
                <textarea
                  id="profile-bio"
                  className="form-textarea"
                  rows={5}
                  value={form.bio}
                  onChange={updateField('bio')}
                  placeholder="Giới thiệu ngắn gọn về bản thân"
                  maxLength={160}
                />
                <p>{form.bio.trim().length}/160 ký tự</p>
              </div>

              <div className="button-row">
                <button className="btn btn-primary" type="submit" disabled={!canSave}>
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
                <button className="btn btn-secondary" type="button" onClick={closeEditor}>
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
