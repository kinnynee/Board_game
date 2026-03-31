const db = require('../config/db');
const bcrypt = require('bcryptjs');

const adminService = {
  // User Management (Phase 3: Added Search)
  async getAllUsers(search = '') {
    let query = db('users').select('id', 'username', 'email', 'display_name', 'role', 'is_active', 'created_at');
    
    if (search) {
      query = query.where(function() {
        this.where('username', 'like', `%${search}%`)
            .orWhere('display_name', 'like', `%${search}%`)
            .orWhere('email', 'like', `%${search}%`);
      });
    }
    
    return await query.orderBy('id', 'desc');
  },

  async updateUser(id, data) {
    const { role, is_active, display_name } = data;
    const updates = {};
    if (role !== undefined) updates.role = role;
    if (is_active !== undefined) updates.is_active = is_active;
    if (display_name !== undefined) updates.display_name = display_name;
    
    await db('users').where({ id }).update(updates);
    return await db('users').where({ id }).first();
  },

  async deleteUser(id) {
    return await db('users').where({ id }).delete();
  },

  async resetUserPassword(id, newPassword = '123456') {
    const password_hash = await bcrypt.hash(newPassword, 10);
    return await db('users').where({ id }).update({ password_hash });
  },

  // Statistics
  async getSystemStats() {
    const [totalUsers, activeUsers, totalGames, totalMessages] = await Promise.all([
      db('users').count('id as count').first(),
      db('users').where({ is_active: true }).count('id as count').first(),
      db('game_scores').count('id as count').first(),
      db('messages').count('id as count').first()
    ]);

    const gameStats = await db('game_scores')
      .select('game_slug')
      .count('id as total_plays')
      .groupBy('game_slug');

    const recentUsers = await db('users')
      .orderBy('created_at', 'desc')
      .limit(5)
      .select('id', 'username', 'display_name', 'created_at');

    return {
      totalUsers: totalUsers.count,
      activeUsers: activeUsers.count,
      totalGamesPlayed: totalGames.count,
      totalMessages: totalMessages.count,
      gameStats,
      recentUsers
    };
  },

  // Game Management (Phase 3: Added Search)
  async getAllGames(search = '') {
    let query = db('games');
    if (search) {
      query = query.where('name', 'like', `%${search}%`)
                   .orWhere('slug', 'like', `%${search}%`);
    }
    return await query.orderBy('id');
  },

  async updateGameStatus(id, enabled) {
    await db('games').where({ id }).update({ enabled });
    return await db('games').where({ id }).first();
  }
};

module.exports = adminService;
