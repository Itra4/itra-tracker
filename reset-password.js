require("dotenv").config();
const { createClient } = require("@libsql/client");
const bcrypt = require("bcryptjs");

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

(async () => {
  // Show current users
  const users = await client.execute("SELECT id, name, email, role FROM User");
  console.log("Current users:");
  console.table(users.rows);

  // Reset William's password
  const hash = await bcrypt.hash("William2026!", 10);
  await client.execute({
    sql: `UPDATE User SET passwordHash = ? WHERE email = ?`,
    args: [hash, "william@itrarecycling.com"],
  });
  console.log("\nWilliam password reset to: William2026!");

  // Reset Avery's password too
  const hash2 = await bcrypt.hash("Avery2026!", 10);
  await client.execute({
    sql: `UPDATE User SET passwordHash = ? WHERE email = ?`,
    args: [hash2, "avery@itrarecycling.com"],
  });
  console.log("Avery password reset to: Avery2026!");
})();
