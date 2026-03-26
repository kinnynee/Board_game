require('dotenv').config();

const sharedConfig = {
  migrations: {
    directory: './migrations',
  },
  seeds: {
    directory: './seeds',
  },
  pool: {
    min: 0,
    max: 10,
  },
};

function buildConnection() {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
    };
  }

  return {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 5433),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'board_game_db',
  };
}

module.exports = {
  development: {
    client: 'pg',
    connection: buildConnection(),
    ...sharedConfig,
  },
  production: {
    client: 'pg',
    connection: buildConnection(),
    ...sharedConfig,
  },
};
