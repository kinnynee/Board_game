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
      setNotice('Cap nhat profile thanh cong.');
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
          <p>Dang tai thong tin profile...</p>
        </div>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="content-panel">
        <div className="empty-state">
          <h2>Khong tai duoc profile</h2>
          <p>{error || 'Khong co du lieu de hien thi.'}</p>
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
          <p className="profile-meta">Tham gia ngay {formatDate(profile.created_at)}</p>
        </div>
        <button className="btn btn-secondary" type="button" onClick={() => setEditing((prev) => !prev)}>
          {editing ? 'Dong form' : 'Chinh sua profile'}
        </button>
      </section>

      <div className="stats-strip">
        <article className="stat-tile">
          <span className="stat-label">Vai tro</span>
          <strong>{profile.role}</strong>
        </article>
        <article className="stat-tile">
          <span className="stat-label">Trang thai</span>
          <strong>{profile.is_active ? 'Dang hoat dong' : 'Da khoa'}</strong>
        </article>
        <article className="stat-tile">
          <span className="stat-label">Luot choi</span>
          <strong>{profile.stats?.total_games || 0}</strong>
        </article>
        <article className="stat-tile">
          <span className="stat-label">Diem trung binh</span>
          <strong>{profile.stats?.average_score ? profile.stats.average_score.toFixed(1) : '0.0'}</strong>
        </article>
        <article className="stat-tile">
          <span className="stat-label">Danh gia da gui</span>
          <strong>{profile.stats?.ratings_given || 0}</strong>
        </article>
      </div>

      {notice && <div className="alert alert-success">{notice}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="profile-grid">
        <article className="profile-card">
          <div className="panel-heading">
            <div>
              <p className="section-tag">Thong tin</p>
              <h2>Thong tin ca nhan</h2>
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
              <strong>{profile.bio || 'Ban chua cap nhat gioi thieu.'}</strong>
            </div>
            <div>
              <span>Cap nhat lan cuoi</span>
              <strong>{formatDate(profile.updated_at)}</strong>
            </div>
          </div>
        </article>

        <article className="profile-card">
          <div className="panel-heading">
            <div>
              <p className="section-tag">Cap nhat</p>
              <h2>Chinh sua profile</h2>
            </div>
          </div>

          {editing ? (
            <form className="auth-form" onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label" htmlFor="profile-display-name">Display name</label>
                <input
                  id="profile-display-name"
                  className="form-input"
                  value={form.display_name}
                  onChange={(event) => setForm((prev) => ({ ...prev, display_name: event.target.value }))}
                  placeholder="Nhap ten hien thi"
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
                  placeholder="Gioi thieu ngan gon ve ban than"
                />
              </div>

              <div className="button-row">
                <button className="btn btn-primary" type="submit" disabled={saving}>
                  {saving ? 'Dang luu...' : 'Luu thay doi'}
                </button>
                <button className="btn btn-secondary" type="button" onClick={() => setEditing(false)}>
                  Huy
                </button>
              </div>
            </form>
          ) : (
            <div className="empty-state empty-state-left">
              <p>Bat "Chinh sua profile" de cap nhat ten hien thi, email va bio cua ban.</p>
            </div>
          )}
        </article>
      </div>

      <section className="content-panel">
        <div className="panel-heading">
          <div>
            <p className="section-tag">Game History</p>
            <h2>Diem so gan day</h2>
          </div>
        </div>

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
            <p>Chua co diem so nao. Sau khi choi game va luu ket qua, lich su se hien o day.</p>
          </div>
        )}
      </section>
    </div>
  );
}
