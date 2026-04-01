import { Link, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminGames from './pages/AdminGames';
import './App.css';

function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-shell">
        <div className="page-loader">
          <div className="spinner" />
          <p>Dang kiem tra phien dang nhap...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function AdminRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-shell">
        <div className="page-loader">
          <div className="spinner" />
          <p>Dang kiem tra quyen admin...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

function PublicOnlyRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-shell">
        <div className="page-loader">
          <div className="spinner" />
          <p>Dang tai du lieu...</p>
        </div>
      </div>
    );
  }

  return user ? <Navigate to="/profile" replace /> : <Outlet />;
}

function HomePage() {
  const { user } = useAuth();

  return (
    <section className="landing-grid">
      <div className="landing-copy">
        <p className="section-tag">React + REST API</p>
        <h1>Dang ky, dang nhap va profile da duoc ghep lai thanh mot luong hoan chinh.</h1>
        <p className="lead">
          Phien ban nay giu dung tinh than bai hoc: form controlled bang <code>useState</code>, call API bang
          <code>fetch</code>, JWT luu trong <code>localStorage</code>, va profile cap nhat qua <code>PUT</code>.
        </p>
        <div className="button-row">
          {user ? (
            <Link className="btn btn-primary" to="/profile">Mo profile</Link>
          ) : (
            <>
              <Link className="btn btn-primary" to="/login">Dang nhap</Link>
              <Link className="btn btn-secondary" to="/register">Dang ky</Link>
            </>
          )}
        </div>
      </div>

      <div className="landing-card">
        <h2>Flow da hoc</h2>
        <ul className="feature-list">
          <li>POST <code>/api/auth/register</code> tao tai khoan va tra JWT.</li>
          <li>POST <code>/api/auth/login</code> xac thuc username/email va password.</li>
          <li>GET <code>/api/auth/me</code> lay nguoi dung hien tai tu token.</li>
          <li>PUT <code>/api/users/me</code> cap nhat display name, email va bio.</li>
        </ul>
      </div>
    </section>
  );
}

function AppLayout() {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/">
          <span className="brand-mark">BG</span>
          <div>
            <strong>Board Game Project</strong>
            <p>Auth and profile module</p>
          </div>
        </Link>

        <nav className="topbar-actions">
          <button className="btn btn-secondary btn-compact" type="button" onClick={toggleDarkMode}>
            {darkMode ? 'Light' : 'Dark'}
          </button>

          {user ? (
            <>
              {user.role === 'admin' && (
                <Link className="btn btn-secondary btn-compact" to="/admin">Admin</Link>
              )}
              <Link className="btn btn-secondary btn-compact" to="/profile">Profile</Link>
              <button className="btn btn-primary btn-compact" type="button" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="btn btn-secondary btn-compact" to="/login">Login</Link>
              <Link className="btn btn-primary btn-compact" to="/register">Register</Link>
            </>
          )}
        </nav>
      </header>

      <main className="page-frame">
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />

        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/games" element={<AdminGames />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
