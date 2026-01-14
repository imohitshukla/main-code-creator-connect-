const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const config = require('../config/config.json');

// 1. Keep your env setup
const env = process.env.NODE_ENV || 'production';
const dbConfig = config[env];

// 🔴 THE FIX: Force SSL for Neon Database
// We add this manually so it works even if config.json is missing it
dbConfig.dialectOptions = {
  ssl: {
    require: true,
    rejectUnauthorized: false // This fixes the "Connection terminated" error
  }
};

let sequelize;
if (dbConfig.use_env_variable) {
  sequelize = new Sequelize(process.env[dbConfig.use_env_variable], dbConfig);
} else {
  sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);
}

const db = {
  sequelize,
  Sequelize,
};

// ... keep the rest of the file (fs.readdirSync...) exactly the same