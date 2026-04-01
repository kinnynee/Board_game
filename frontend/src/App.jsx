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
import RankingsPage from './pages/RankingsPage';
import AchievementsPage from './pages/AchievementsPage';
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
          <p className="section-tag">Web Board Game</p>
          <h1>Chào mừng đến với web Board Game.</h1>
          <p className="lead">
            Thử thách trí tuệ với 7 tựa game kinh điển: Caro, Tic-Tac-Toe, Rắn Săn Mồi và hơn thế nữa. 
            Kết bạn, leo rank và thu thập vô số thành tựu độc quyền!
          </p>

          <div className="button-row">
            {user ? (
              <>
                <Link className="btn btn-primary" to="/rankings">🏆 Xem Bảng Xếp Hạng</Link>
                <Link className="btn btn-secondary" to="/achievements">🌟 Thành Tựu Của Tôi</Link>
              </>
            ) : (
              <>
                <Link className="btn btn-primary" to="/login">Đăng nhập để chơi ngay</Link>
                <Link className="btn btn-secondary" to="/register">Tạo tài khoản mới</Link>
              </>
            )}
          </div>

          <div className="showcase-grid">
            <article className="mini-panel">
              <span className="mini-label">Thi Đấu</span>
              <strong>Hệ Thống Rank Kịch Tính</strong>
              <p>Tham gia đấu hạng, so tài kỹ năng và leo lên top 10 cao thủ xuất sắc nhất server.</p>
            </article>
            <article className="mini-panel">
              <span className="mini-label">Sưu Tập</span>
              <strong>Thành Tựu Cực Chất</strong>
              <p>Mở khóa danh hiệu lấp lánh độc quyền khi đạt các cột mốc khủng trong game.</p>
            </article>
          </div>
        </div>

        <div className="landing-card page-stack">
          <div>
            <p className="section-tag">Thư Viện</p>
            <h2>Khám phá thế giới Game</h2>
          </div>

          <ul className="feature-list">
            <li>🎮 <strong>Caro 5 & Caro 4:</strong> Đấu trí cờ ca-ro kinh điển.</li>
            <li>🐍 <strong>Rắn Săn Mồi:</strong> Phiên bản điều khiển mượt mà kịch tính.</li>
            <li>💎 <strong>Ghép Hàng 3:</strong> Giải trí cực đỉnh với phong cách Match-3.</li>
            <li>🃏 <strong>Cờ Trí Nhớ:</strong> Lật thẻ tìm cặp siêu hack não.</li>
          </ul>

          <div className="insight-card">
            <span className="mini-label">Bảng Tin</span>
            <strong>{user ? `Chào mừng cao thủ @${user.username} quay trở lại!` : 'Hãy tham gia cùng hàng ngàn kỳ thủ khác'}</strong>
            <p>
              {user
                ? 'Bạn đã sẵn sàng để tiếp tục chuỗi thắng của mình? Vào sảnh game ngay nào!'
                : 'Đăng ký tài khoản trong 1 phút để lưu điểm, kết bạn và đua top mỗi ngày.'}
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
                  <p>Play & Connect</p>
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
                        <Link className="menu-link" to="/rankings">🏆 Xếp Hạng</Link>
                      </MenuItem>
                      <MenuItem>
                        <Link className="menu-link" to="/achievements">🌟 Thành Tựu</Link>
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
          <Route path="/rankings" element={<RankingsPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
