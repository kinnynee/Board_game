const ratingService = require('../services/ratingService');

async function listRatings(req, res) {
  const ratings = await ratingService.listRatings(req.params.slug);
  return res.json(ratings);
}

async function upsertRating(req, res) {
  const savedRating = await ratingService.upsertRating(req.user.id, req.params.slug, req.body);
  return res.status(201).json(savedRating);
}

module.exports = {
  listRatings,
  upsertRating,
};

/* */
