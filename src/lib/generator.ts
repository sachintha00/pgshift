import * as fs from "fs";
import * as path from "path";

export class Generator {
  private migrationsDir: string;
  private seedersDir: string;

  constructor(migrationsDir: string, seedersDir: string) {
    this.migrationsDir = migrationsDir;
    this.seedersDir = seedersDir;
  }

  generateMigration(name: string) {
    if (!fs.existsSync(this.migrationsDir)) {
      fs.mkdirSync(this.migrationsDir, { recursive: true });
    }

    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T.]/g, "")
      .slice(0, 14);
    const fileName = `${timestamp}_${name}.ts`;
    const filePath = path.join(this.migrationsDir, fileName);

    const template = `
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

exports.default = {
    name: '${name}',
    async up(client) {
        // Add your up migration logic here
        await client.query('CREATE TABLE example (id SERIAL PRIMARY KEY, name VARCHAR(255))');
    },
    async down(client) {
        // Add your down migration logic here
        await client.query('DROP TABLE example');
    },
};
        `.trim();

    fs.writeFileSync(filePath, template);
    console.log(`Migration created: ${filePath}`);
  }

  generateSeeder(name: string) {
    if (!fs.existsSync(this.seedersDir)) {
      fs.mkdirSync(this.seedersDir, { recursive: true });
    }

    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T.]/g, "")
      .slice(0, 14);
    const fileName = `${timestamp}_${name}.ts`;
    const filePath = path.join(this.seedersDir, fileName);

    const template = `
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

exports.default = {
    name: '${name}',
    async seed(client) {
        // Add your seeding logic here
        await client.query('INSERT INTO example (name) VALUES ($1)', ['Sample Data']);
    },
};
        `.trim();

    fs.writeFileSync(filePath, template);
    console.log(`Seeder created: ${filePath}`);
  }
}
