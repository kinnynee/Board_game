const db = require('../db');

class RatingService {
  async addRating(data) {
    return db('ratings').insert({ 
      user_id: data.userId, 
      game_slug: data.gameSlug, 
      rating: data.rating, 
      comment: data.comment 
    });
  }
  
  async getRatingsByGame(gameSlug) {
    return db('ratings').where('game_slug', gameSlug).orderBy('created_at', 'desc');
  }
}

module.exports = new RatingService();
