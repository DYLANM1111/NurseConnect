const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool,
    dialectOptions: dbConfig.dialectOptions,
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.User = require('./user')(sequelize, Sequelize);
db.NurseProfile = require('./nurse')(sequelize, Sequelize);
db.License = require('./license')(sequelize, Sequelize); 
//db.Certification = require('./certification')(sequelize, Sequelize);
db.Facility = require('./facility')(sequelize, Sequelize);
db.Shift = require('./shift')(sequelize, Sequelize);
db.ShiftApplication = require('./application')(sequelize, Sequelize);
//db.TimeRecord = require('./timeRecord')(sequelize, Sequelize);
db.Payment = require('./payment')(sequelize, Sequelize);

// Set up associations
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

module.exports = db;