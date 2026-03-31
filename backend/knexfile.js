<<<<<<< HEAD
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
    return process.env.DATABASE_URL;
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
    client: 'sqlite3',
    connection: {
      filename: './dev.sqlite3',
    },
    useNullAsDefault: true,
    ...sharedConfig,
  },
  production: {
    client: 'pg',
    connection: buildConnection(),
    ...sharedConfig,
  },
};
=======
require("dotenv").config();

const sharedConfig = {
  client: "pg",
  connection: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  },
  migrations: {
    directory: "./migrations",
  },
  seeds: {
    directory: "./seeds",
  },
};

module.exports = {
  development: {
    ...sharedConfig,
  },
  staging: {
    ...sharedConfig,
  },
  production: {
    ...sharedConfig,
  },
};

>>>>>>> 06170f5a5e6b6979cccd2b4ff1fd1ea4a02eb102
