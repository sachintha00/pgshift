import { Pool, PoolClient } from "pg";
import * as fs from "fs";
import * as path from "path";

export interface Seeder {
  seed: (client: PoolClient) => Promise<void>;
  name: string;
}

export interface SeederConfig {
  pool: Pool;
  seedersDir: string;
}

export class Seeder {
  private client: PoolClient | null = null;
  private config: SeederConfig;

  constructor(config: SeederConfig) {
    this.config = config;
  }

  async initialize() {
    this.client = await this.config.pool.connect();
  }

  async runSeeders() {
    await this.initialize();
    try {
      const files = fs.readdirSync(this.config.seedersDir).sort();

      for (const file of files) {
        const name = file.replace(/\.ts$/, "");
        const seeder: Seeder = require(path.join(
          this.config.seedersDir,
          file
        )).default;
        console.log(`Running seeder: ${name}`);
        await seeder.seed(this.client!);
      }
    } catch (error) {
      console.error("Seeder error:", error);
      throw error;
    } finally {
      this.client?.release();
    }
  }

  async run() {
    // Renamed from 'seed' to 'run'
    await this.runSeeders();
  }
}
