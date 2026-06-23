const { Client } = require('pg');

const passwords = ['', 'admin', 'admin123', '123456', '1234', 'postgres', 'root', 'password', 'grivadb', 'Griva123!', 'GrivaPassword123!'];

async function test() {
  for (const pw of passwords) {
    const client = new Client({
      user: 'postgres',
      host: 'localhost',
      database: 'postgres',
      password: pw,
      port: 5432,
    });
    try {
      await client.connect();
      console.log(`SUCCESS WITH PASSWORD: "${pw}"`);
      await client.end();
      return;
    } catch (err) {
      console.log(`Failed with password: "${pw}": ${err.message}`);
    }
  }
}

test();
