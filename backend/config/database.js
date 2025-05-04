const { Sequelize } = require('sequelize');
require('dotenv').config();
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_SERVER,
    port: process.env.DB_PORT,
    dialect: 'mssql',
    dialectOptions: {
      options: {
        encrypt: false, // Temporarily disable encryption to bypass TLS issue
        trustServerCertificate: true
      }
    },
    logging: (msg) => console.log(`Sequelize: ${msg}`), // Enhanced logging
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Test the connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();module.exports = sequelize;