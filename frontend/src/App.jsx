import { useEffect, useState } from "react";
import "./App.css";
import { getBackendStatus } from "./api";
import { AppProvider } from "./contexts/AppContext";
import HomePage from "./pages/HomePage";
import AchievementsPage from "./pages/AchievementsPage";
import RankingsPage from "./pages/RankingsPage";

function App() {
  const [backendMessage, setBackendMessage] = useState("Checking backend connection...");
  const [connectionState, setConnectionState] = useState("loading");
  const [currentPage, setCurrentPage] = useState("home");

  useEffect(() => {
    let isMounted = true;

    async function loadStatus() {
      try {
        const data = await getBackendStatus();

        if (isMounted) {
          setBackendMessage(data.message || "Backend connected");
          setConnectionState("success");
        }
      } catch {
        if (isMounted) {
          setBackendMessage("Cannot reach backend. Start backend on port 5000.");
          setConnectionState("error");
        }
      }
    }

    loadStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  const renderPage = () => {
    if (currentPage === "achievements") {
      return <AchievementsPage onBack={() => setCurrentPage("home")} />;
    }
    if (currentPage === "rankings") {
      return <RankingsPage onBack={() => setCurrentPage("home")} />;
    }
    return (
      <HomePage
        backendMessage={backendMessage}
        connectionState={connectionState}
        onNavigate={setCurrentPage}
      />
    );
  };

  return (
    <AppProvider>
      {renderPage()}
    </AppProvider>
  );
}

export default App;
