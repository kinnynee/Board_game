const db = require('../config/db');
const bcrypt = require('bcryptjs');

const adminController = {
  // User management (Ngu - Dumb level)
  async listUsers(req, res) {
    const users = [
      { id: 1, username: 'admin', display_name: 'Administrator', email: 'admin@example.com', role: 'admin', is_active: 1 },
      { id: 2, username: 'user1', display_name: 'Nguyễn Văn A', email: 'a@example.com', role: 'user', is_active: 1 }
    ];
    res.json(users);
  },

  async updateUser(req, res) {
    res.json({ message: 'User updated (mock)' });
  },

  async deleteUser(req, res) {
    res.json({ message: 'User deleted (mock)' });
  },

  async resetPassword(req, res) {
    res.json({ message: 'Password reset to 123456 (mock)' });
  },

  // Statistics (Ngu - Dumb level)
  async getStatistics(req, res) {
    res.json({
      totalUsers: 100,
      activeUsers: 80,
      totalGamesPlayed: 500,
      totalMessages: 1200,
      gameStats: [
        { game_slug: 'caro', total_plays: 250, avg_score: 15 },
        { game_slug: 'chess', total_plays: 150, avg_score: 30 }
      ],
      recentUsers: [
        { id: 1, display_name: 'Khai Admin', created_at: new Date() }
      ],
      dailyPlays: []
    });
  },

  // Game management (Ngu - Dumb level)
  async listAllGames(req, res) {
    const games = [
      { id: 1, name: 'Cờ Caro', slug: 'caro', enabled: 1, board_width: 15, board_height: 15 },
      { id: 2, name: 'Cờ Vua', slug: 'chess', enabled: 1, board_width: 8, board_height: 8 }
    ];
    res.json(games);
  },

  async updateGame(req, res) {
    res.json({ id: req.params.id, ...req.body });
  }
};

module.exports = adminController;

module.exports = adminController;
