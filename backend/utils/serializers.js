<<<<<<< HEAD
function serializeUser(user, options = {}) {
=======
function serializeUser(user) {
>>>>>>> 06170f5a5e6b6979cccd2b4ff1fd1ea4a02eb102
  if (!user) {
    return null;
  }

<<<<<<< HEAD
  const payload = {
    id: user.id,
    username: user.username,
    display_name: user.display_name,
    bio: user.bio || '',
    role: user.role,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };

  if (options.includeEmail) {
    payload.email = user.email;
  }

  if (options.includeStatus) {
    payload.is_active = user.is_active;
  }

  return payload;
}

function serializeGame(game) {
  if (!game) {
=======
  return {
    id: user.id,
    username: user.username,
    email: user.email ?? null,
    display_name: user.display_name ?? "",
    bio: user.bio ?? "",
    created_at: user.created_at ?? null,
    updated_at: user.updated_at ?? null,
  };
}

function serializeScore(score) {
  if (!score) {
>>>>>>> 06170f5a5e6b6979cccd2b4ff1fd1ea4a02eb102
    return null;
  }

  return {
<<<<<<< HEAD
    id: game.id,
    slug: game.slug,
    name: game.name,
    description: game.description || '',
    board_size: game.board_size || '',
    is_enabled: game.is_enabled,
    created_at: game.created_at,
    updated_at: game.updated_at,
    average_rating: game.average_rating !== undefined && game.average_rating !== null
      ? Number(game.average_rating)
      : null,
    rating_count: game.rating_count !== undefined && game.rating_count !== null
      ? Number(game.rating_count)
      : 0,
  };
}

module.exports = {
  serializeUser,
  serializeGame,
=======
    id: score.id,
    game_name: score.game_name,
    score: score.score,
    played_at: score.played_at ?? null,
  };
}

function serializeScores(scores = []) {
  return scores.map(serializeScore).filter(Boolean);
}

module.exports = {
  serializeScore,
  serializeScores,
  serializeUser,
>>>>>>> 06170f5a5e6b6979cccd2b4ff1fd1ea4a02eb102
};
