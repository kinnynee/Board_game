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
  getOwnProfile() {
    return request('/users/me');
  },
  getProfile(id) {
    return request(`/users/${id}`);
  },
  getMyScores(limit = 20) {
    const params = new URLSearchParams({ limit: String(limit) });
    return request(`/games/scores/me?${params.toString()}`);
  },
  getGames() {
    return request('/games');
  },
  getGame(slug) {
    return request(`/games/${slug}`);
  },
  postRating(slug, rating, comment) {
    return request(`/games/${slug}/ratings`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    });
  },
  updateProfile(profileData) {
    return request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
};
