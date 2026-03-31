const adminService = require('../services/adminService');

const adminController = {
  // User Management
  async listUsers(req, res) {
    try {
      const users = await adminService.getAllUsers();
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async updateUser(req, res) {
    try {
      const user = await adminService.updateUser(req.params.id, req.body);
      res.json({ message: 'Cập nhật thành công', user });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async deleteUser(req, res) {
    try {
      if (parseInt(req.params.id) === req.user.id) {
        return res.status(400).json({ error: 'Không thể xóa tài khoản của chính mình' });
      }
      await adminService.deleteUser(req.params.id);
      res.json({ message: 'Xóa người dùng thành công' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async resetPassword(req, res) {
    try {
      await adminService.resetUserPassword(req.params.id);
      res.json({ message: 'Mật khẩu đã được reset về 123456' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Statistics
  async getStatistics(req, res) {
    try {
      const stats = await adminService.getSystemStats();
      res.json(stats);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Game Management
  async listAllGames(req, res) {
    try {
      const games = await adminService.getAllGames();
      res.json(games);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async updateGame(req, res) {
    try {
      const { enabled } = req.body;
      const game = await adminService.updateGameStatus(req.params.id, enabled);
      res.json(game);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = adminController;
