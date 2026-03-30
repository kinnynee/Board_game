function serializeUser(user) {
  if (!user) {
    return null;
  }

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
    return null;
  }

  return {
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
};
