<<<<<<< HEAD
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let payload = null;

  try {
    payload = await response.json();
  } catch (error) {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.message || 'Request failed.');
  }

  return payload;
}

export const api = {
  register(userData) {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  login(username, password) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },
  getMe() {
    return request('/auth/me');
  },
  getProfile(id) {
    return request(`/users/${id}`);
  },
  updateProfile(profileData) {
    return request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
};
=======
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
>>>>>>> 06170f5a5e6b6979cccd2b4ff1fd1ea4a02eb102
