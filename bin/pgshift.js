#!/usr/bin/env node
const args = process.argv.slice(2);
const command = args[0];

if (command === "generate") {
  require("../dist/cli/generate");
} else {
  require("../dist/cli/migrate");
}
