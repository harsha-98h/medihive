import { pool } from "./db";
import fs from "fs";
import path from "path";

export async function runMigrations() {
  const sql = fs.readFileSync(path.join(__dirname, "../../src/database/schema.sql"), "utf8");
  await pool.query(sql);
  console.log("Migrations ran successfully");
}
