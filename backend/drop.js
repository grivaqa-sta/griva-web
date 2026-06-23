require('dotenv').config();
const { sequelize } = require('./src/config/db'); 
sequelize.query('DROP TABLE IF EXISTS "discover_more" CASCADE;')
  .then(() => { 
    console.log('Dropped table discover_more'); 
    process.exit(0); 
  })
  .catch(e => { 
    console.error(e); 
    process.exit(1); 
  });
