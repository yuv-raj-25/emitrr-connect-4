import pkg from "pg";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const { Pool } = pkg;

let pool: InstanceType<typeof Pool> | null = null;

const connectDB = async () => {
  if (pool) return pool;

  const connectionConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host: process.env.PGHOST,
        port: Number(process.env.PGPORT) || 5432,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
      };

  pool = new Pool(connectionConfig);

  await pool.connect();
  console.log("PostgreSQL connected");
  return pool;
};

const runMigrations = async () => {
  if (!pool) throw new Error("DB not initialized. Call connectDB() first.");

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const migrationsDir = path.join(__dirname, "migrations");

  if (!fs.existsSync(migrationsDir)) {
    console.log("No migrations directory found, skipping.");
    return;
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
    try {
      await pool.query(sql);
      console.log(`✅ Migration applied: ${file}`);
    } catch (err: any) {
      console.error(`❌ Migration failed: ${file}`, err.message);
    }
  }

  console.log("All migrations completed.");
};

const getDB = () => {
  if (!pool) {
    throw new Error("DB not initialized. Call connectDB() first.");
  }
  return pool;
};

export { connectDB, runMigrations, getDB };