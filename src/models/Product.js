const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  stock: {
    type: Number,
    default: 0
  },
  image: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);
