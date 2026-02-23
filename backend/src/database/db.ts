import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in .env");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export async function testConnection() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT NOW()");
    console.log("DB connected at:", res.rows[0].now);
  } finally {
    client.release();
  }
}
