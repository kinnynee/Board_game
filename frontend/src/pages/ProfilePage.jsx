import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ display_name: '', email: '', bio: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    setLoading(true);
    api.getProfile(user.id)
      .then((data) => {
        setProfile(data);
        setForm({
          display_name: data.display_name || '',
          email: data.email || '',
          bio: data.bio || '',
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const handleSave = async () => {
    setError('');
    setSaving(true);

    try {
      const updated = await api.updateProfile(form);
      setProfile(updated);
      updateUser(updated);
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="content-panel">
        <div className="empty-state">
          <div className="spinner" />
          <p>Dang tai profile...</p>
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
    <section className="content-panel">
      <div className="profile-hero">
        <div className="avatar avatar-xl">{profile.display_name?.[0] || '?'}</div>
        <div className="profile-hero-copy">
          <p className="section-tag">Profile</p>
          <h1>{profile.display_name}</h1>
          <p className="profile-meta">@{profile.username}</p>
          <p className="profile-meta">
            Joined {new Date(profile.created_at).toLocaleDateString('en-GB')}
          </p>
        </div>
        <button className="btn btn-secondary" type="button" onClick={() => setEditing((prev) => !prev)}>
          {editing ? 'Dong form' : 'Chinh sua'}
        </button>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <div className="profile-grid">
        <article className="profile-card">
          <h2>Thong tin ca nhan</h2>
          <dl className="profile-fields">
            <div>
              <dt>Username</dt>
              <dd>{profile.username}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{profile.email || 'Chua cap nhat'}</dd>
            </div>
            <div>
              <dt>Bio</dt>
              <dd>{profile.bio || 'Ban chua them gioi thieu ban than.'}</dd>
            </div>
          </dl>
        </article>

        <article className="profile-card">
          <h2>Cap nhat profile</h2>
          <p className="card-copy">
            Phan nay dung controlled form voi <code>useState</code>, gui <code>PUT</code> len REST API va cap nhat lai state sau khi luu.
          </p>

          <div className="auth-form">
            {editing ? (
              <>
                <div className="form-group">
                  <label className="form-label" htmlFor="profile-display-name">Display name</label>
                  <input
                    id="profile-display-name"
                    className="form-input"
                    value={form.display_name}
                    onChange={(event) => setForm({ ...form, display_name: event.target.value })}
                    placeholder="Display name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="profile-email">Email</label>
                  <input
                    id="profile-email"
                    className="form-input"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    placeholder="Email"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="profile-bio">Bio</label>
                  <textarea
                    id="profile-bio"
                    className="form-textarea"
                    rows={4}
                    value={form.bio}
                    onChange={(event) => setForm({ ...form, bio: event.target.value })}
                    placeholder="Viet vai dong gioi thieu"
                  />
                </div>

                <div className="button-row">
                  <button className="btn btn-primary" type="button" onClick={handleSave} disabled={saving}>
                    {saving ? 'Dang luu...' : 'Luu thay doi'}
                  </button>
                  <button className="btn btn-secondary" type="button" onClick={() => setEditing(false)}>
                    Huy
                  </button>
                </div>
              </>
            ) : (
              <div className="empty-state empty-state-left">
                <p>Bam "Chinh sua" de cap nhat ten hien thi, email va bio.</p>
              </div>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
