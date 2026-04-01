import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from '@headlessui/react';
import { Link, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import './App.css';

function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-shell">
        <div className="page-loader">
          <div className="spinner" />
          <p>Đang kiểm tra phiên đăng nhập...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
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
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return user ? <Navigate to="/profile" replace /> : <Outlet />;
}

function HomePage() {
  const { user } = useAuth();

  return (
    <div className="page-stack">
      <section className="landing-grid">
        <div className="landing-copy">
          <p className="section-tag">React + REST API</p>
          <h1>Board Game Project đã có luồng auth và profile gọn, rõ, dễ mở rộng.</h1>
          <p className="lead">
            Giao diện này giữ cách học dễ theo dõi: controlled form bằng <code>useState</code>, gọi API bằng
            <code>fetch</code>, token JWT lưu trong <code>localStorage</code>, và profile được cập nhật qua
            <code>PUT /api/users/me</code>.
          </p>

          <div className="button-row">
            {user ? (
              <>
                <Link className="btn btn-primary" to="/profile">Mở profile</Link>
                <Link className="btn btn-secondary" to="/register">Tạo thêm tài khoản</Link>
              </>
            ) : (
              <>
                <Link className="btn btn-primary" to="/login">Đăng nhập</Link>
                <Link className="btn btn-secondary" to="/register">Đăng ký</Link>
              </>
            )}
          </div>

          <div className="showcase-grid">
            <article className="mini-panel">
              <span className="mini-label">Auth</span>
              <strong>Đăng nhập và xác thực JWT</strong>
              <p>Token được phục hồi từ local storage và kiểm tra lại qua endpoint `me`.</p>
            </article>
            <article className="mini-panel">
              <span className="mini-label">Profile</span>
              <strong>Cập nhật thông tin cá nhân</strong>
              <p>Display name, email và bio được đồng bộ ngay sau khi lưu thành công.</p>
            </article>
          </div>
        </div>

        <div className="landing-card page-stack">
          <div>
            <p className="section-tag">Flow đã có</p>
            <h2>Những gì đang hoạt động</h2>
          </div>

          <ul className="feature-list">
            <li>POST <code>/api/auth/register</code> tạo tài khoản mới và trả về token.</li>
            <li>POST <code>/api/auth/login</code> hỗ trợ đăng nhập bằng username hoặc email.</li>
            <li>GET <code>/api/auth/me</code> phục hồi phiên đăng nhập sau khi tải lại trang.</li>
            <li>PUT <code>/api/users/me</code> cập nhật profile và đồng bộ lại UI.</li>
          </ul>

          <div className="insight-card">
            <span className="mini-label">Trạng thái</span>
            <strong>{user ? `Đang đăng nhập với @${user.username}` : 'Sẵn sàng cho luồng đăng nhập mới'}</strong>
            <p>
              {user
                ? 'Bạn có thể vào profile để xem thông tin, cập nhật bio, và kiểm tra lịch sử điểm số.'
                : 'Nếu chưa có tài khoản, bạn có thể đăng ký trong vài bước và vào app ngay sau đó.'}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function AppLayout() {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <div className="app-shell">
      <Disclosure as="header" className="topbar-shell">
        {({ open }) => (
          <>
            <div className="topbar">
              <Link className="brand" to="/">
                <span className="brand-mark">BG</span>
                <div>
                  <strong>Board Game Project</strong>
                  <p>Auth and profile module</p>
                </div>
              </Link>

              <nav className="topbar-actions topbar-actions-desktop">
                <Link className="btn btn-secondary btn-compact" to="/">Home</Link>

                <button className="btn btn-secondary btn-compact" type="button" onClick={toggleDarkMode}>
                  {darkMode ? 'Light mode' : 'Dark mode'}
                </button>

                {user ? (
                  <Menu as="div" className="account-menu">
                    <MenuButton className="btn btn-primary btn-compact">
                      {user.display_name || user.username}
                    </MenuButton>
                    <MenuItems className="menu-items" anchor="bottom end">
                      <MenuItem>
                        <Link className="menu-link" to="/profile">Hồ sơ của tôi</Link>
                      </MenuItem>
                      <MenuItem>
                        <button className="menu-link menu-link-button" type="button" onClick={logout}>
                          Đăng xuất
                        </button>
                      </MenuItem>
                    </MenuItems>
                  </Menu>
                ) : (
                  <>
                    <Link className="btn btn-secondary btn-compact" to="/login">Đăng nhập</Link>
                    <Link className="btn btn-primary btn-compact" to="/register">Đăng ký</Link>
                  </>
                )}
              </nav>

              <DisclosureButton className="btn btn-secondary btn-compact nav-toggle">
                {open ? 'Đóng menu' : 'Mở menu'}
              </DisclosureButton>
            </div>

            <DisclosurePanel className="mobile-panel">
              <div className="mobile-panel-inner">
                <Link className="btn btn-secondary btn-compact" to="/">Home</Link>
                <button className="btn btn-secondary btn-compact" type="button" onClick={toggleDarkMode}>
                  {darkMode ? 'Chuyển sang sáng' : 'Chuyển sang tối'}
                </button>

                {user ? (
                  <>
                    <Link className="btn btn-secondary btn-compact" to="/profile">Hồ sơ</Link>
                    <button className="btn btn-primary btn-compact" type="button" onClick={logout}>
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <>
                    <Link className="btn btn-secondary btn-compact" to="/login">Đăng nhập</Link>
                    <Link className="btn btn-primary btn-compact" to="/register">Đăng ký</Link>
                  </>
                )}
              </div>
            </DisclosurePanel>
          </>
        )}
      </Disclosure>

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
      </Route>
    </Routes>
  );
}

export default App;
