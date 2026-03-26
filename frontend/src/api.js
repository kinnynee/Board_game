const API_URL = '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    },
    ...options
  };
  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

export const api = {
  // Auth
  login: (username, password) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  register: (data) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => apiRequest('/auth/me'),

  // Users
  getProfile: (id) => apiRequest(`/users/${id}`),
  updateProfile: (data) => apiRequest('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (data) => apiRequest('/users/password', { method: 'PUT', body: JSON.stringify(data) }),
  searchUsers: (q) => apiRequest(`/users/search?q=${encodeURIComponent(q)}`),

  // Friends
  getFriends: () => apiRequest('/friends'),
  getPendingRequests: () => apiRequest('/friends/pending'),
  sendFriendRequest: (friend_id) => apiRequest('/friends/request', { method: 'POST', body: JSON.stringify({ friend_id }) }),
  respondFriendRequest: (id, action) => apiRequest(`/friends/respond/${id}`, { method: 'PUT', body: JSON.stringify({ action }) }),
  removeFriend: (id) => apiRequest(`/friends/${id}`, { method: 'DELETE' }),

  // Messages
  getConversations: () => apiRequest('/messages/conversations'),
  getMessages: (userId) => apiRequest(`/messages/${userId}`),
  sendMessage: (receiver_id, content) => apiRequest('/messages', { method: 'POST', body: JSON.stringify({ receiver_id, content }) }),

  // Games
  getGames: () => apiRequest('/games'),
  getGame: (slug) => apiRequest(`/games/${slug}`),
  saveGame: (data) => apiRequest('/games/save', { method: 'POST', body: JSON.stringify(data) }),
  loadSaves: (slug) => apiRequest(`/games/saves/${slug}`),
  loadSave: (id) => apiRequest(`/games/save/${id}`),
  deleteSave: (id) => apiRequest(`/games/save/${id}`, { method: 'DELETE' }),
  submitScore: (data) => apiRequest('/games/score', { method: 'POST', body: JSON.stringify(data) }),
  getMyScores: () => apiRequest('/games/scores/me'),

  // Ratings
  rateGame: (data) => apiRequest('/ratings', { method: 'POST', body: JSON.stringify(data) }),
  getGameRatings: (slug) => apiRequest(`/ratings/game/${slug}`),
  getMyRating: (slug) => apiRequest(`/ratings/my/${slug}`),

  // Rankings
  getGlobalRanking: (slug) => apiRequest(`/rankings/global/${slug}`),
  getFriendsRanking: (slug) => apiRequest(`/rankings/friends/${slug}`),
  getPersonalRanking: (slug) => apiRequest(`/rankings/personal/${slug}`),

  // Achievements
  getAchievements: () => apiRequest('/achievements'),
  getUserAchievements: (userId) => apiRequest(`/achievements/user/${userId}`),
  checkAchievements: () => apiRequest('/achievements/check', { method: 'POST' }),

  // Admin
  adminGetUsers: () => apiRequest('/admin/users'),
  adminUpdateUser: (id, data) => apiRequest(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeleteUser: (id) => apiRequest(`/admin/users/${id}`, { method: 'DELETE' }),
  adminResetPassword: (id) => apiRequest(`/admin/users/${id}/reset-password`, { method: 'POST' }),
  adminGetStatistics: () => apiRequest('/admin/statistics'),
  adminGetGames: () => apiRequest('/admin/games'),
  adminUpdateGame: (id, data) => apiRequest(`/admin/games/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};
