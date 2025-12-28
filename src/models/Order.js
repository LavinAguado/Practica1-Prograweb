const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      quantity: Number
    }
  ],
  total: Number,
  status: {
    type: String,
    default: 'CREATED'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', OrderSchema);
