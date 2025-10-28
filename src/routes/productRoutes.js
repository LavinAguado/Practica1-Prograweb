const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authenticateJWT, authorizeRoles } = require('../middleware/authenticateJWT');

// List products (any authenticated user or public? según requisitos: visualizar productos por user)
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error listando productos' });
  }
});

// Create (admin only)
router.post('/', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  try {
    const { title, description, price, image } = req.body;
    const p = new Product({ title, description, price, image });
    await p.save();
    res.status(201).json(p);
  } catch (err) {
    res.status(500).json({ message: 'Error creando producto' });
  }
});

// Get details
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(p);
  } catch (err) {
    res.status(500).json({ message: 'Error obteniendo producto' });
  }
});

// Update (admin only)
router.put('/:id', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error actualizando producto' });
  }
});

// Delete (admin only)
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json({ message: 'Producto eliminado' });
  } catch (err) {
    res.status(500).json({ message: 'Error eliminando producto' });
  }
});

module.exports = router;

