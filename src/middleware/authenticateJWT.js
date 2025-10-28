const jwt = require('jsonwebtoken');
const config = require('../../config');
const User = require('../models/User');

function generateToken(user) {
  const payload = { id: user._id, username: user.username, role: user.role };
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}

async function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token faltante' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    // attach user minimal info
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' });
  }
}

function authorizeRoles(...allowed){ // middleware factory
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'No autenticado' });
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    next();
  };
}

// Helper para sockets: verifica token enviado en handshake (handshake.auth.token)
async function verifySocketToken(socket, next) {
  const token = socket.handshake?.auth?.token;
  if (!token) return next(new Error('Token faltante en conexión Socket.IO'));
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    socket.user = decoded; // attach
    return next();
  } catch (err) {
    return next(new Error('Token inválido'));
  }
}

module.exports = { authenticateJWT, authorizeRoles, generateToken, verifySocketToken };

