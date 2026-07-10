const { sequelize } = require("./src/config/db");

async function check() {
  try {
    const products = await sequelize.query(
      `SELECT id, title, stock, attributes, variants, is_active FROM products ORDER BY id DESC LIMIT 20;`,
      { type: sequelize.QueryTypes.SELECT }
    );

    console.log("LAST 20 PRODUCTS:");
    for (const p of products) {
      console.log(`ID: ${p.id} | Title: ${p.title} | Stock: ${p.stock} | Active: ${p.is_active} | Attrs: ${JSON.stringify(p.attributes)}`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}

check();
