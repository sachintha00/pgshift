import { Pool, PoolClient } from "pg";
import * as fs from "fs";
import * as path from "path";

export interface Migration {
  up: (client: PoolClient) => Promise<void>;
  down: (client: PoolClient) => Promise<void>;
  name: string;
}

export interface MigratorConfig {
  pool: Pool;
  migrationsDir: string;
}

export class Migrator {
  private client: PoolClient | null = null;
  private config: MigratorConfig;

  constructor(config: MigratorConfig) {
    this.config = config;
  }

  async initialize() {
    this.client = await this.config.pool.connect();
    await this.client.query(`
            CREATE TABLE IF NOT EXISTS migrations (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                timestamp BIGINT NOT NULL,
                executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
  }

  async getExecutedMigrations(): Promise<string[]> {
    const result = await this.client!.query(
      "SELECT name FROM migrations ORDER BY timestamp"
    );
    return result.rows.map((row: any) => row.name);
  }

  async runMigrations(direction: "up" | "down" = "up") {
    await this.initialize();
    try {
      const files = fs
        .readdirSync(this.config.migrationsDir)
        .filter((file) => file.endsWith(".js") || file.endsWith(".ts")) // Support both .js and .ts
        .sort();
      const executed = await this.getExecutedMigrations();

      for (const file of files) {
        const timestamp = file.split("_")[0];
        const name = file.replace(/\.(ts|js)$/, "");
        const fullName = `${timestamp}_${name.split("_").slice(1).join("_")}`;

        if (direction === "up" && !executed.includes(fullName)) {
          const migrationModule = require(path.join(
            this.config.migrationsDir,
            file
          ));
          const migration: Migration =
            migrationModule.default || migrationModule; // Handle ES/CommonJS
          console.log(`Running migration: ${fullName}`);
          await migration.up(this.client!);
          await this.client!.query(
            "INSERT INTO migrations (name, timestamp) VALUES ($1, $2)",
            [fullName, parseInt(timestamp)]
          );
        } else if (direction === "down" && executed.includes(fullName)) {
          const migrationModule = require(path.join(
            this.config.migrationsDir,
            file
          ));
          const migration: Migration =
            migrationModule.default || migrationModule;
          console.log(`Rolling back migration: ${fullName}`);
          await migration.down(this.client!);
          await this.client!.query("DELETE FROM migrations WHERE name = $1", [
            fullName,
          ]);
        }
      }
    } catch (error) {
      console.error("Migration error:", error);
      throw error;
    } finally {
      this.client?.release();
    }
  }

  async migrate() {
    await this.runMigrations("up");
  }

  async rollback() {
    await this.runMigrations("down");
  }
}
