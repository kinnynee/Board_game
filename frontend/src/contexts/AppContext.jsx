import { createContext, useContext } from "react";

const AppContext = createContext({
  appName: "Board Game",
  apiUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
});

export function AppProvider({ children }) {
  return (
    <AppContext.Provider
      value={{
        appName: "Board Game",
        apiUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}

