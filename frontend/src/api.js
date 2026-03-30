import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

export async function getBackendStatus() {
  const response = await api.get("/");
  return response.data;
}

export default api;

