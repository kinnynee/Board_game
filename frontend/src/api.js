import axios from "axios";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

function unwrap(response) {
  return response.data;
}

export const api = {
  async getBackendStatus() {
    return unwrap(await http.get("/"));
  },
  async register(payload) {
    return unwrap(await http.post("/api/auth/register", payload));
  },
  async login(username, password) {
    return unwrap(await http.post("/api/auth/login", { username, password }));
  },
  async getMe() {
    return unwrap(await http.get("/api/auth/me"));
  },
  async getOwnProfile() {
    return unwrap(await http.get("/api/users/me"));
  },
  async updateProfile(payload) {
    return unwrap(await http.patch("/api/users/me", payload));
  },
  async getMyScores() {
    return unwrap(await http.get("/api/users/me/scores"));
  },
};

export async function getBackendStatus() {
  return api.getBackendStatus();
}

export default api;
