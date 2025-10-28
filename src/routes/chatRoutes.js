const express = require('express');
const router = express.Router();
const path = require('path');
const { authenticateJWT } = require('../middleware/authenticateJWT');

// Servir chat.html (requiere autenticación en frontend, pero aquí devolvemos el archivo)
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'chat.html'));
});

module.exports = router;

