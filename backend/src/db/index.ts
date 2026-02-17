import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

let pool: InstanceType<typeof Pool> | null = null;

const connectDB = async () => {
  if (pool) return pool;

  pool = new Pool({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT) || 5432,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
  });

  await pool.connect();
  console.log("PostgreSQL connected");
  return pool;
};

const getDB = () => {
  if (!pool) {
    throw new Error("DB not initialized. Call connectDB() first.");
  }
  return pool;
};

export { connectDB, getDB };