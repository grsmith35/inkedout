const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const path = require('path');
const { ApolloServerPluginLandingPageGraphQLPlayground } = require("apollo-server-core");


const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');
const bodyParser = require("body-parser"); 

const PORT = process.env.PORT || 3001;
const app = express();

const startServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    // playground: true,
    playground: {
        endpoint: "/api/graphql",
      },
    introspection: true,
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground({ embed: true })]
  });
  await server.start();
  server.applyMiddleware({ app });
  console.log(`Use GraphQL at https://studio.apollographql.com/sandbox/explorer`);
};

startServer()

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

// Serve up static assets
if (process.env.NODE_ENV === 'production') {
  // app.use(express.static(path.join(__dirname, 'build', 'index.html')));
  // app.use(express.static('public/client'))
  
  app.use(express.static(path.join(__dirname, 'build')));
}

app.get('*', (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
  // res.sendFile(path.join(__dirname, 'build', 'index.html'));
  // res.sendFile(path.join(__dirname + '/dist/YOURPROJECTNAME/index.html'));

});

db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
  });
});