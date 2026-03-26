const db = require('../config/db');
const bcrypt = require('bcryptjs');

const adminController = {
  // User management
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
      res.json({ message: 'User updated' });
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
      res.json({ message: 'User deleted' });
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

  // Statistics
  async getStatistics(req, res) {
    try {
      const totalUsers = await db('users').count('id as count').first();
      const activeUsers = await db('users').where({ is_active: true }).count('id as count').first();
      const totalGames = await db('game_scores').count('id as count').first();
      const totalMessages = await db('messages').count('id as count').first();

      const gameStats = await db('game_scores')
        .select('game_slug')
        .count('id as total_plays')
        .sum('score as total_score')
        .avg('score as avg_score')
        .groupBy('game_slug');

      const recentUsers = await db('users').orderBy('created_at', 'desc').limit(5)
        .select('id', 'username', 'display_name', 'created_at');

      const dailyPlays = await db('game_scores')
        .select(db.raw("date(created_at) as date"))
        .count('id as plays')
        .groupBy(db.raw("date(created_at)"))
        .orderBy('date', 'desc')
        .limit(7);

      res.json({
        totalUsers: totalUsers.count,
        activeUsers: activeUsers.count,
        totalGamesPlayed: totalGames.count,
        totalMessages: totalMessages.count,
        gameStats,
        recentUsers,
        dailyPlays
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Game management
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
      const { enabled, board_width, board_height, name, description, instructions } = req.body;
      const updates = {};
      if (enabled !== undefined) updates.enabled = enabled;
      if (board_width !== undefined) updates.board_width = board_width;
      if (board_height !== undefined) updates.board_height = board_height;
      if (name !== undefined) updates.name = name;
      if (description !== undefined) updates.description = description;
      if (instructions !== undefined) updates.instructions = instructions;
      await db('games').where({ id: req.params.id }).update(updates);
      const game = await db('games').where({ id: req.params.id }).first();
      res.json(game);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = adminController;
