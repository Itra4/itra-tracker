require("dotenv").config();
const { createClient } = require("@libsql/client");
const bcrypt = require("bcryptjs");
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
  // William
  const williamId = randomUUID();
  const williamHash = await bcrypt.hash("William2026!", 10);
  await client.execute({
    sql: `INSERT OR IGNORE INTO User (id, name, email, passwordHash, role, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    args: [williamId, "William", "william@itrarecycling.com", williamHash, "ADMIN"],
  });
  console.log("William ready");

  // Avery
  const averyId = randomUUID();
  const averyHash = await bcrypt.hash("Avery2026!", 10);
  await client.execute({
    sql: `INSERT OR IGNORE INTO User (id, name, email, passwordHash, role, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    args: [averyId, "Avery", "avery@itrarecycling.com", averyHash, "WAREHOUSE"],
  });
  console.log("Avery ready");

  // Categories
  for (const name of categories) {
    await client.execute({
      sql: `INSERT OR IGNORE INTO Category (id, name, createdAt, updatedAt)
            VALUES (?, ?, datetime('now'), datetime('now'))`,
      args: [randomUUID(), name],
    });
  }
  console.log("Categories ready");
  console.log("\nSeed complete");
})();
