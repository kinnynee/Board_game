const db = require('../db');

class GameService {
  async getAllGames() {
    return db('games').where('enabled', true);
  }

  async getGameBySlug(slug) {
    return db('games').where('slug', slug).first();
  }
}

module.exports = new GameService();
