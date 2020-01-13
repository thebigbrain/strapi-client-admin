import React from "react";
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
  ApolloProvider as Provider,
// @ts-ignore
} from "@apollo/client";

const location = window.location;
const uri = `${location.protocol}//${location.hostname}:1337/graphql`;

const httpLink = new HttpLink({
  uri
});

const authMiddleware = new ApolloLink((operation, forward) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem("jwt");
  if (token) {
    // add the authorization to the headers
    operation.setContext({
      headers: {
        authorization: `Bearer ${token}`
      }
    });
  }

  return forward(operation);
});

// const absintheAfterware = new ApolloLink((operation, forward) => {
//   return forward(operation).map(({ payload, ...result }) => ({
//     ...result,
//     errors: payload && payload.errors,
//     data: payload && payload.data
//   }));
// });

// const cache = new InMemoryCache({
//   cacheRedirects: {
//     Query: {
//       collection: (_, args, { getCacheKey }) =>
//         getCacheKey({ __typename: "Collection", path: args.path })
//     }
//   }
// });
const cache = new InMemoryCache();

export const client = new ApolloClient({
  link: ApolloLink.from([authMiddleware, httpLink]),
  cache,
  queryDeduplication: true
});

export const ApolloProvider = props => <Provider client={client} {...props} />;
