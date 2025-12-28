const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');

const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');

async function startApolloServer(app) {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();

  app.use('/graphql', expressMiddleware(server));
  console.log('🚀 GraphQL listo en /graphql');
}

module.exports = startApolloServer;
