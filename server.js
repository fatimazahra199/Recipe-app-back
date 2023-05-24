const express = require("express");
const cors = require("cors");
const connection = require("./config/connection");
const { ApolloServer } = require("apollo-server-express");
const { typeDefs, resolvers } = require("./schemas");
const { authMiddleware } = require("./utils/auth");

const path = require("path");

const app = express();

app.use(cors());

connection.on(
  "error",
  console.error.bind(console, "MongoDB connection error:")
);

const PORT = process.env.PORT || 3001;

// Create the Apollo Server instance

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});


const startApolloServer = async () => {
  await server.start();
  server.applyMiddleware({ app });

  connection.once("open", () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(
        `Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`
      );
    });
  });
};

startApolloServer();


