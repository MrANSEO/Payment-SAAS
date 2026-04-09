const { Sequelize } = require('sequelize');

let sequelize = null;
let dbConnected = false;

// Vérifie si les variables de BD sont configurées
const isDBConfigured = process.env.DB_NAME && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_HOST;

if (isDBConfigured) {
  try {
    sequelize = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
        retry: { max: 3 }
      }
    );
  } catch (error) {
    console.warn('⚠️ Impossible de créer la connexion Sequelize:', error.message);
    sequelize = null;
  }
} else {
  console.warn('⚠️ Variables de base de données non configurées. BD désactivée.');
}

module.exports = { sequelize, isDBConfigured, dbConnected };