
import { ApolloServer } from "apollo-server";

import "reflect-metadata";
import { buildSchema } from "type-graphql";

async function bootstrap() {
  try {
    const schema = await buildSchema({
      resolvers: [__dirname + "/**/*.resolver.{js,ts}"],
      validate: false
    });

    // other initialization code, like creating http server
    // Create the GraphQL server
    const server = new ApolloServer({
      schema,
      playground: true
    });

    // Start the server
    const { url } = await server.listen(5000);
    console.log(`Server is running, GraphQL Playground available at ${url}`);
  } catch (error) {
    console.log('Error starting server', error)
  }
}

bootstrap(); // actually run the async function
