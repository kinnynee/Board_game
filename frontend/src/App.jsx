import { useEffect, useState } from "react";
import "./App.css";
import { getBackendStatus } from "./api";
import { AppProvider } from "./contexts/AppContext";
import { AuthProvider } from "./contexts/AuthContext";
import HomePage from "./pages/HomePage";
<<<<<<< HEAD
=======
import AchievementsPage from "./pages/AchievementsPage";
import RankingsPage from "./pages/RankingsPage";
>>>>>>> 06170f5a5e6b6979cccd2b4ff1fd1ea4a02eb102

function App() {
  const [backendMessage, setBackendMessage] = useState("Checking backend connection...");
  const [connectionState, setConnectionState] = useState("loading");
<<<<<<< HEAD
=======
  const [currentPage, setCurrentPage] = useState("home");
>>>>>>> 06170f5a5e6b6979cccd2b4ff1fd1ea4a02eb102

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

<<<<<<< HEAD
  return (
    <AppProvider>
      <AuthProvider>
        <HomePage backendMessage={backendMessage} connectionState={connectionState} />
      </AuthProvider>
=======
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
>>>>>>> 06170f5a5e6b6979cccd2b4ff1fd1ea4a02eb102
    </AppProvider>
  );
}

<<<<<<< HEAD
export default App;
=======
export default App;
>>>>>>> 06170f5a5e6b6979cccd2b4ff1fd1ea4a02eb102
