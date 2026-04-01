import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.admin.getStats()
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div className="admin-container">
      <header className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Overview of system activity and management tools.</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-value">{stats.total_users}</p>
          <Link to="/admin/users" className="btn btn-secondary btn-compact">Manage Users</Link>
        </div>
        <div className="stat-card">
          <h3>Total Games</h3>
          <p className="stat-value">{stats.total_games}</p>
          <Link to="/admin/games" className="btn btn-secondary btn-compact">Manage Games</Link>
        </div>
        <div className="stat-card">
          <h3>Total Scores</h3>
          <p className="stat-value">{stats.total_scores}</p>
          <p className="stat-sub">Recorded by users</p>
        </div>
      </div>

      <section className="admin-actions">
        <h2>Quick Actions</h2>
        <div className="button-row">
          <Link to="/admin/users" className="btn btn-primary">User Management</Link>
          <Link to="/admin/games" className="btn btn-primary">Game Management</Link>
        </div>
      </section>
    </div>
  );
}
