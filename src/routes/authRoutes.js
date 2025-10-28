const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken } = require('../middleware/authenticateJWT');

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: 'Datos incompletos' });

    // permitir asignar admin solo si ya existe un admin? (simplificado: puedes asignarlo desde body)
    const existing = await User.findOne({ $or: [{ username }, { email }]});
    if (existing) return res.status(409).json({ message: 'Usuario o email ya existe' });

    const user = new User({ username, email, password, role: role || 'user' });
    await user.save();
    const token = generateToken(user);
    res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error en registro' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Datos incompletos' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Credenciales inválidas' });

    const token = generateToken(user);
    res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error en login' });
  }
});

module.exports = router;

