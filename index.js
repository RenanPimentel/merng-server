const mongoose = require("mongoose");
const { ApolloServer, PubSub } = require("apollo-server");

const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");
const { MONGODB, PORT } = require("./config");

const pubsub = new PubSub();
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req, pubsub }),
});

mongoose
  .connect(MONGODB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => server.listen({ port: PORT || 5000 }))
  .then(serverOptions => console.log(`Server ready at ${serverOptions.url}`))
  .catch(err => console.log({ err }));
