require("dotenv").config();
const { createClient } = require("@libsql/client");
const { randomUUID } = require("crypto");

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const categories = [
  "Circuit Boards",
  "Batteries",
  "Hard Drives",
  "Laptops",
  "Desktops/CPUs",
  "RAM",
  "Mixed E-Waste",
  "Other",
];

(async () => {
  for (const name of categories) {
    await client.execute({
      sql: `INSERT OR IGNORE INTO Category (id, name, active, createdAt)
            VALUES (?, ?, 1, datetime('now'))`,
      args: [randomUUID(), name],
    });
    console.log("Added:", name);
  }
  console.log("\nCategories done");
})();
