require("dotenv").config();

function normalizeEnvValue(value) {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

function parseSslConfig() {
  const sslValue = normalizeEnvValue(process.env.DB_SSL).toLowerCase();

  if (sslValue === "false") {
    return false;
  }

  if (sslValue === "true" || process.env.NODE_ENV === "production") {
    return { rejectUnauthorized: false };
  }

  return false;
}

function resolveConnection() {
  const connectionString = normalizeEnvValue(process.env.SUPABASE_DB_URL)
    || normalizeEnvValue(process.env.DATABASE_URL);

  if (!connectionString) {
    throw new Error("SUPABASE_DB_URL (or DATABASE_URL) is required for database connection.");
  }

  return {
    connectionString,
    ssl: parseSslConfig(),
  };
}

const sharedConfig = {
  client: "pg",
  connection: resolveConnection(),
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

