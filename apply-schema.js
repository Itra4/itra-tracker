require("dotenv").config();
const { createClient } = require("@libsql/client");
const fs = require("fs");

const url = process.env.DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("Missing DATABASE_URL or TURSO_AUTH_TOKEN in .env");
  process.exit(1);
}

const client = createClient({ url, authToken });
const sql = fs.readFileSync("schema.sql", "utf8");

(async () => {
  const statements = sql.split(";").map(s => s.trim()).filter(s => s.length > 0);
  for (const stmt of statements) {
    try {
      await client.execute(stmt);
      console.log("OK:", stmt.slice(0, 55).replace(/\n/g, " ") + "...");
    } catch (e) {
      console.log("SKIP/ERR:", e.message.slice(0, 80));
    }
  }
  console.log("\nDone applying schema to Turso");
})();
