import dotenv from "dotenv";
import { Pool, QueryResult } from "pg";

// Load environment variables before resolving DB config
dotenv.config();

// Resolve database connection values from a variety of env var names
const resolveDbConfig = () => {
  // Prefer full DATABASE_URL if provided
  const databaseUrl =
    process.env.DATABASE_URL || process.env.PG_CONNECTION_STRING;

  if (databaseUrl) {
    console.log("Using DATABASE_URL for Postgres connection");
    return { connectionString: databaseUrl } as any;
  }

  // Support common env var names used by Railway, Docker, and local setups
  const user =
    process.env.PGUSER ||
    process.env.POSTGRES_USER ||
    process.env.DB_USER ||
    process.env.DB_USER ||
    "postgres";
  const password =
    process.env.POSTGRES_PASSWORD ||
    process.env.PGPASSWORD ||
    process.env.DB_PASSWORD ||
    process.env.DB_PASSWORD ||
    "password123";
  const host =
    process.env.PGHOST ||
    process.env.POSTGRES_HOST ||
    process.env.DB_HOST ||
    process.env.DB_HOST ||
    "localhost";
  const port = parseInt(
    process.env.PGPORT ||
      process.env.POSTGRES_PORT ||
      process.env.DB_PORT ||
      process.env.DB_PORT ||
      "5432",
  );
  const database =
    process.env.PGDATABASE ||
    process.env.POSTGRES_DB ||
    process.env.DB_NAME ||
    process.env.POSTGRES_DB ||
    "portionist";

  return { user, password, host, port, database } as any;
};

const dbConfig = resolveDbConfig();

const pool = new Pool(dbConfig);

pool.on("error", (error) => {
  console.error("Unexpected error on idle client", error);
});

export const query = async (
  text: string,
  params?: (string | number | boolean | null)[],
): Promise<QueryResult> => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log("Executed query", { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error("Database query error", { text, error });
    throw error;
  }
};

export const getClient = async () => {
  return pool.connect();
};

export const ensureConnection = async (retries = 5, delayMs = 2000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(
        `Attempting DB connection (attempt ${attempt}/${retries})...`,
      );
      const client = await pool.connect();
      client.release();
      console.log("Postgres connection successful");
      return;
    } catch (err) {
      console.error(
        `Postgres connection attempt ${attempt} failed:`,
        (err as any)?.message || err,
      );
      if (attempt === retries) throw err;
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
};

export default pool;
