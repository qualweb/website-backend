import { ApolloServer } from 'apollo-server';
import mongoose from 'mongoose';
import bluebird from 'bluebird';

import typeDefs from './graphql/definitions';
import resolvers from './graphql/resolvers';

mongoose.connect('mongodb://localhost/qualweb', { promiseLibrary: <any> bluebird, useNewUrlParser: true })
  .then(() =>  console.log('Connected to QualWeb database'))
  .catch((err: Error) => console.error(err));

const server: ApolloServer = new ApolloServer({
  typeDefs,
  resolvers
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});

/*
if (module.hot) {
  module.hot.accept();
  module.hot.dispose(() => console.log('Module disposed.'));
}*/