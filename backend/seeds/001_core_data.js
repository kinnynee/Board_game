const bcrypt = require('bcryptjs');

const users = [
  {
    username: 'admin',
    email: 'admin@boardgame.local',
    password: 'admin123',
    display_name: 'Administrator',
    role: 'admin',
    bio: 'Quan tri vien cua he thong Board Game.',
    is_active: true,
  },
  {
    username: 'player1',
    email: 'player1@boardgame.local',
    password: '123456',
    display_name: 'Player One',
    role: 'user',
    bio: 'Nguoi choi mau so 1.',
    is_active: true,
  },
  {
    username: 'player2',
    email: 'player2@boardgame.local',
    password: '123456',
    display_name: 'Player Two',
    role: 'user',
    bio: 'Nguoi choi mau so 2.',
    is_active: true,
  },
  {
    username: 'player3',
    email: 'player3@boardgame.local',
    password: '123456',
    display_name: 'Player Three',
    role: 'user',
    bio: 'Nguoi choi mau so 3.',
    is_active: true,
  },
  {
    username: 'player4',
    email: 'player4@boardgame.local',
    password: '123456',
    display_name: 'Player Four',
    role: 'user',
    bio: 'Nguoi choi mau so 4.',
    is_active: true,
  },
  {
    username: 'player5',
    email: 'player5@boardgame.local',
    password: '123456',
    display_name: 'Player Five',
    role: 'user',
    bio: 'Nguoi choi mau so 5.',
    is_active: true,
  },
];

const games = [
  {
    slug: 'caro-5',
    name: 'Caro 5',
    description: 'Xep 5 quan lien tiep tren ban co 15x15.',
    board_size: '15x15',
    is_enabled: true,
  },
  {
    slug: 'caro-4',
    name: 'Caro 4',
    description: 'Xep 4 quan lien tiep tren ban co 10x10.',
    board_size: '10x10',
    is_enabled: true,
  },
  {
    slug: 'tic-tac-toe',
    name: 'Tic-Tac-Toe',
    description: 'Co XO co dien tren ban co 3x3.',
    board_size: '3x3',
    is_enabled: true,
  },
  {
    slug: 'snake',
    name: 'Ran San Moi',
    description: 'Dieu khien ran an moi tren ban co 20x15.',
    board_size: '20x15',
    is_enabled: true,
  },
  {
    slug: 'match-3',
    name: 'Ghep Hang 3',
    description: 'Game Match-3 theo phong cach Candy Crush.',
    board_size: '8x8',
    is_enabled: true,
  },
  {
    slug: 'memory-card',
    name: 'Co Tri Nho',
    description: 'Lat ghep cap the tren ban co 6x6.',
    board_size: '6x6',
    is_enabled: true,
  },
  {
    slug: 'free-draw',
    name: 'Bang Ve Tu Do',
    description: 'Ve tu do tren ban 20x15.',
    board_size: '20x15',
    is_enabled: true,
  },
];

exports.seed = async function(knex) {
  const hashedUsers = users.map((user) => ({
    username: user.username,
    email: user.email,
    password_hash: bcrypt.hashSync(user.password, 10),
    display_name: user.display_name,
    bio: user.bio,
    role: user.role,
    is_active: user.is_active,
    updated_at: knex.fn.now(),
  }));

  await knex('users')
    .insert(hashedUsers)
    .onConflict('username')
    .merge({
      email: knex.raw('EXCLUDED.email'),
      password_hash: knex.raw('EXCLUDED.password_hash'),
      display_name: knex.raw('EXCLUDED.display_name'),
      bio: knex.raw('EXCLUDED.bio'),
      role: knex.raw('EXCLUDED.role'),
      is_active: knex.raw('EXCLUDED.is_active'),
      updated_at: knex.fn.now(),
    });

  await knex('games')
    .insert(games.map((game) => ({
      ...game,
      updated_at: knex.fn.now(),
    })))
    .onConflict('slug')
    .merge({
      name: knex.raw('EXCLUDED.name'),
      description: knex.raw('EXCLUDED.description'),
      board_size: knex.raw('EXCLUDED.board_size'),
      is_enabled: knex.raw('EXCLUDED.is_enabled'),
      updated_at: knex.fn.now(),
    });
};
