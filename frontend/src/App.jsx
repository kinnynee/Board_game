import { useEffect, useState } from "react";
import "./App.css";
import { getBackendStatus } from "./api";
import { AppProvider } from "./contexts/AppContext";
import HomePage from "./pages/HomePage";

function App() {
  const [backendMessage, setBackendMessage] = useState("Checking backend connection...");
  const [connectionState, setConnectionState] = useState("loading");

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

  return (
    <AppProvider>
      <HomePage backendMessage={backendMessage} connectionState={connectionState} />
    </AppProvider>
  );
}

export default App;
