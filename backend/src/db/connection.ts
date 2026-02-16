import { Pool, QueryResult } from "pg";

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password123",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "portionist",
});

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

export default pool;
