#!/usr/bin/env node
import { Generator } from "../lib/generator";
import * as path from "path";

// No environment loading needed for generate commands
async function run() {
  const command = process.argv[2]; // 'generate' or 'generate-seeder'
  const name = process.argv[3]; // e.g., 'create_users_table' or 'seed_users'

  const generator = new Generator(
    path.resolve(process.cwd(), "migrations"),
    path.resolve(process.cwd(), "seeders")
  );

  if (command === "generate" && name) {
    generator.generateMigration(name);
  } else if (command === "generate-seeder" && name) {
    generator.generateSeeder(name);
  } else {
    console.log("Usage:");
    console.log(
      "  pgshift generate <migration_name>         # Create a migration file"
    );
    console.log(
      "  pgshift generate-seeder <seeder_name>    # Create a seeder file"
    );
    console.log("Examples:");
    console.log("  pgshift generate create_users_table");
    console.log("  pgshift generate-seeder seed_users");
    process.exit(1);
  }
}

run();
