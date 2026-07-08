const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });

async function test() {
  console.log("Testing connection to:", process.env.DATABASE_URL);
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  try {
    await client.connect();
    console.log("SUCCESSFULLY CONNECTED TO NEON DB!");
    await client.end();
  } catch (err) {
    console.error("ERROR:", err.message);
  }
}
test();
