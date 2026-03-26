function serializeUser(user, options = {}) {
  if (!user) {
    return null;
  }

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
    return null;
  }

  return {
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
};
