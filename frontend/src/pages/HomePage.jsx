import { useAppContext } from "../contexts/AppContext";

function HomePage({ backendMessage, connectionState, onNavigate }) {
  const { appName, apiUrl } = useAppContext();

  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero-panel">
          <p className="hero-kicker">Frontend workspace</p>
          <h1 className="hero-title">{appName}</h1>
          <p className="hero-copy">
            Giao diện React + Vite da duoc tao san, co cau truc assets, contexts, pages va san
            ket noi toi backend API.
          </p>

          <div className="status-grid">
            <article className="status-card">
              <span className="status-label">Frontend</span>
              <p className="status-value">Ready with Vite</p>
            </article>

            <article className="status-card">
              <span className="status-label">API Base URL</span>
              <p className="status-value">{apiUrl}</p>
            </article>

            <article className="status-card">
              <span className="status-label">Backend status</span>
              <p className={`status-value ${connectionState === "error" ? "status-error" : "status-ok"}`}>
                {backendMessage}
              </p>
            </article>
          </div>

          <div className="nav-buttons">
            <button className="nav-btn" onClick={() => onNavigate("achievements")}>
              🏅 Thành Tựu
            </button>
            <button className="nav-btn" onClick={() => onNavigate("rankings")}>
              🏆 Bảng Xếp Hạng
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default HomePage;

