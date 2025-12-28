const typeDefs = `
  type Product {
    id: ID!
    title: String!
    price: Float!
    stock: Int!
  }

  type OrderProduct {
    product: Product!
    quantity: Int!
  }

  type Order {
    id: ID!
    user: ID
    products: [OrderProduct!]!
    total: Float!
    status: String!
  }

  input OrderItemInput {
    productId: ID!
    quantity: Int!
  }

  type Query {
    products: [Product!]!
    orders: [Order!]!
  }

  type Mutation {
    createProduct(title: String!, price: Float!, stock: Int!): Product
    createOrder(items: [OrderItemInput!]!, userId: ID): Order
  }
`;

module.exports = typeDefs;
