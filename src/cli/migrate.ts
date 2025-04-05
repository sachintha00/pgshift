#!/usr/bin/env node
import { Pool } from "pg";
import { Migrator } from "../lib/migrator";
import * as path from "path";
import * as fs from "fs";
import * as dotenv from "dotenv";

// Determine environment and load appropriate .env file
const env = process.argv[2] || process.env.NODE_ENV || "dev";
const envFileDot = `.env.${env}`; // e.g., .env.prod
const envFilePlain = `${env}.env`; // e.g., prod.env
const envPathDot = path.resolve(process.cwd(), envFileDot);
const envPathPlain = path.resolve(process.cwd(), envFilePlain);
const envPath = fs.existsSync(envPathDot) ? envPathDot : envPathPlain;

if (!fs.existsSync(envPath)) {
  console.error(
    `No environment file found. Tried '${envFileDot}' and '${envFilePlain}'.`
  );
  console.error(
    `Please create one with DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, and DB_NAME.`
  );
  process.exit(1);
}

dotenv.config({ path: envPath });

async function run() {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const migrator = new Migrator({
    pool,
    migrationsDir: path.resolve(process.cwd(), "migrations"),
  });

  const action = process.argv[3] || "migrate";

  try {
    if (action === "migrate") {
      await migrator.migrate();
      console.log(`Migrations completed for ${env} environment`);
    } else if (action === "rollback") {
      await migrator.rollback();
      console.log(`Rollback completed for ${env} environment`);
    } else {
      console.log("Usage: pgshift [env] [migrate|rollback]");
      console.log("Example: pgshift prod migrate");
    }
  } catch (error) {
    console.error(`Error in ${env} environment:`, error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
