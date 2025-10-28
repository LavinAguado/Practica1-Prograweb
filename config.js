require('dotenv').config();

module.exports = {
  port: process.env.PORT || 4000,
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/portal-productos',
  jwtSecret: process.env.JWT_SECRET || 'cambiar_esto',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d'
};

