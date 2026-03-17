module.exports = {
  development: {
    client: 'better-sqlite3',
    connection: {
      filename: './dev.sqlite3'
    },
    useNullAsDefault: true,
    migrations: {
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  },
  // To switch to Supabase/PostgreSQL later:
  // production: {
  //   client: 'pg',
  //   connection: process.env.DATABASE_URL,
  //   migrations: { directory: './migrations' },
  //   seeds: { directory: './seeds' }
  // }
};
