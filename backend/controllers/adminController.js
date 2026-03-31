const db = require('../config/db');
const bcrypt = require('bcryptjs');

const adminController = {
  // User management (Phase 2: Database integrated)
  async listUsers(req, res) {
    try {
      const users = await db('users').select('id', 'username', 'email', 'display_name', 'role', 'is_active', 'created_at').orderBy('id');
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async updateUser(req, res) {
    try {
      const { role, is_active, display_name } = req.body;
      const updates = {};
      if (role !== undefined) updates.role = role;
      if (is_active !== undefined) updates.is_active = is_active;
      if (display_name !== undefined) updates.display_name = display_name;
      await db('users').where({ id: req.params.id }).update(updates);
      res.json({ message: 'User updated successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async deleteUser(req, res) {
    try {
      if (parseInt(req.params.id) === req.user.id) {
        return res.status(400).json({ error: 'Cannot delete yourself' });
      }
      await db('users').where({ id: req.params.id }).delete();
      res.json({ message: 'User deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async resetPassword(req, res) {
    try {
      const password_hash = await bcrypt.hash('123456', 10);
      await db('users').where({ id: req.params.id }).update({ password_hash });
      res.json({ message: 'Password reset to 123456' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Statistics (Phase 2: Database integrated)
  async getStatistics(req, res) {
    try {
      const totalUsers = await db('users').count('id as count').first();
      const activeUsers = await db('users').where({ is_active: true }).count('id as count').first();
      const totalGames = await db('game_scores').count('id as count').first();
      const totalMessages = await db('messages').count('id as count').first();

      const gameStats = await db('game_scores')
        .select('game_slug')
        .count('id as total_plays')
        .groupBy('game_slug');

      const recentUsers = await db('users').orderBy('created_at', 'desc').limit(5)
        .select('id', 'username', 'display_name', 'created_at');

      res.json({
        totalUsers: totalUsers.count,
        activeUsers: activeUsers.count,
        totalGamesPlayed: totalGames.count,
        totalMessages: totalMessages.count,
        gameStats,
        recentUsers
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Game management (Phase 2: Database integrated)
  async listAllGames(req, res) {
    try {
      const games = await db('games').orderBy('id');
      res.json(games);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async updateGame(req, res) {
    try {
      const { enabled } = req.body;
      await db('games').where({ id: req.params.id }).update({ enabled });
      const game = await db('games').where({ id: req.params.id }).first();
      res.json(game);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = adminController;

module.exports = adminController;
