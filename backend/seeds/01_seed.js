exports.seed = async function(knex) {
  const users = await knex('users').select('id', 'username');
  const userMap = users.reduce((map, user) => {
    map[user.username] = user.id;
    return map;
  }, {});

  const games = await knex('games').select('id', 'slug');
  const gameMap = games.reduce((map, game) => {
    map[game.slug] = game.id;
    return map;
  }, {});

  const achievementsCount = await knex('achievements').count('* as total').first();

  if (Number(achievementsCount?.total || 0) === 0) {
    await knex('achievements').insert([
      { name: 'Nguoi moi', description: 'Choi tro choi dau tien', icon: 'new', game_slug: null, condition_type: 'games_played', condition_value: 1 },
      { name: 'Chien thang dau tien', description: 'Thang tro choi dau tien', icon: 'win', game_slug: null, condition_type: 'wins', condition_value: 1 },
      { name: 'Vua Caro', description: 'Thang 10 van Caro', icon: 'caro', game_slug: 'caro-5', condition_type: 'wins', condition_value: 10 },
      { name: 'Ran sieu toc', description: 'Dat 5000 diem trong Snake', icon: 'snake', game_slug: 'snake', condition_type: 'score', condition_value: 5000 },
    ]);
  }

  const currentAchievements = await knex('achievements').select('id', 'name');
  const achievementMap = currentAchievements.reduce((map, item) => {
    map[item.name] = item.id;
    return map;
  }, {});

  const userAchievementsCount = await knex('user_achievements').count('* as total').first();

  if (Number(userAchievementsCount?.total || 0) === 0) {
    await knex('user_achievements').insert([
      { user_id: userMap.player1, achievement_id: achievementMap['Nguoi moi'] },
      { user_id: userMap.player1, achievement_id: achievementMap['Chien thang dau tien'] },
      { user_id: userMap.player2, achievement_id: achievementMap['Nguoi moi'] },
      { user_id: userMap.player3, achievement_id: achievementMap['Ran sieu toc'] },
    ].filter((row) => row.user_id && row.achievement_id));
  }

  const friendsCount = await knex('friends').count('* as total').first();

  if (Number(friendsCount?.total || 0) === 0) {
    await knex('friends').insert([
      { user_id: userMap.player1, friend_id: userMap.player2, status: 'accepted' },
      { user_id: userMap.player1, friend_id: userMap.player3, status: 'accepted' },
      { user_id: userMap.player2, friend_id: userMap.player4, status: 'pending' },
    ].filter((row) => row.user_id && row.friend_id));
  }

  const messagesCount = await knex('messages').count('* as total').first();

  if (Number(messagesCount?.total || 0) === 0) {
    await knex('messages').insert([
      { sender_id: userMap.player1, receiver_id: userMap.player2, content: 'Chao ban! Choi Caro khong?', is_read: true },
      { sender_id: userMap.player2, receiver_id: userMap.player1, content: 'Ok, vao game di!', is_read: true },
      { sender_id: userMap.player3, receiver_id: userMap.player1, content: 'Hom nay minh dat diem snake kha cao.', is_read: false },
    ].filter((row) => row.sender_id && row.receiver_id));
  }

  const scoresCount = await knex('game_scores').count('* as total').first();

  if (Number(scoresCount?.total || 0) === 0) {
    await knex('game_scores').insert([
      { user_id: userMap.player1, game_id: gameMap['caro-5'], score: 1500, duration_seconds: 300, result: 'win', metadata_json: {} },
      { user_id: userMap.player2, game_id: gameMap['snake'], score: 1200, duration_seconds: 180, result: 'lose', metadata_json: {} },
      { user_id: userMap.player3, game_id: gameMap['memory-card'], score: 2800, duration_seconds: 120, result: 'win', metadata_json: {} },
    ].filter((row) => row.user_id && row.game_id));
  }

  const ratingsCount = await knex('ratings').count('* as total').first();

  if (Number(ratingsCount?.total || 0) === 0) {
    await knex('ratings').insert([
      { user_id: userMap.player1, game_id: gameMap['caro-5'], rating: 5, comment: 'Game caro rat vui va de choi.' },
      { user_id: userMap.player2, game_id: gameMap['snake'], rating: 4, comment: 'Snake chay muot va vui.' },
      { user_id: userMap.player3, game_id: gameMap['match-3'], rating: 4, comment: 'Match-3 vui va de test.' },
    ].filter((row) => row.user_id && row.game_id));
  }
};
