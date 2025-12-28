const Product = require('../models/Product');
const Order = require('../models/Order');

const resolvers = {
  Query: {
    products: async () => Product.find(),
    orders: async () => {
     return await Order.find().populate('products.product');
    } 

  },

  Mutation: {
    createProduct: async (_, { title, price, stock }) => {
      const product = new Product({ title, price, stock });
      return await product.save();
    },

    createOrder: async (_, { items }) => {
      let total = 0;
      const orderProducts = [];

      for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) throw new Error('Producto no encontrado');

        if (product.stock < item.quantity) {
          throw new Error(`Stock insuficiente para ${product.title}`);
        }

        product.stock -= item.quantity;
        await product.save();

        total += product.price * item.quantity;

        orderProducts.push({
          product: product._id,
          quantity: item.quantity
        });
      }

      const order = new Order({
        products: orderProducts,
        total,
        status: 'CREATED'
      });

      return await order.save();
    }
  }
};

module.exports = resolvers;
