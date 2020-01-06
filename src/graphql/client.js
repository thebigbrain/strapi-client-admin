import React from "react";
import ApolloClient, {InMemoryCache} from 'apollo-boost';
import { ApolloProvider as Provider } from '@apollo/react-hooks';

export const client = new ApolloClient({
  // uri: 'https://48p1r2roz4.sse.codesandbox.io',
  uri: 'http://localhost:1337/graphql',
  cache: new InMemoryCache()
});

export const ApolloProvider = (props) => <Provider {...props} client={client}/>;

// const httpLink = new BatchHttpLink({
//   uri: '/api/graphql',
// });
//
// const authLink = setContext((_, {headers}) => {
//   // get the authentication token from local storage if it exists
//   const token = localStorage.getItem('jwt');
//   // return the headers to the context so httpLink can read them
//   return {
//     headers: {
//       ...headers,
//       authorization: token ? `Bearer ${JSON.parse(token)}` : '',
//     },
//   };
// });
//
// const absintheAfterware = new ApolloLink((operation, forward) =>
//   forward(operation).map(({payload, ...result}) => ({
//     ...result,
//     errors: payload.errors,
//     data: payload.data,
//   })),
// );
//
// const errorHandler = onError(({graphQLErrors, networkError}) => {
//   if (graphQLErrors) {
//     graphQLErrors.forEach(({message}) => {
//
//     });
//   }
//
//   if (networkError) {
//
//   }
// });

// export const client = new ApolloClient({
//   link: authLink.concat(
//     errorHandler.concat(absintheAfterware.concat(httpLink)),
//   ),
//   cache: new InMemoryCache({
//     cacheRedirects: {
//       Query: {
//         collection: (_, args, {getCacheKey}) =>
//           getCacheKey({__typename: 'Collection', path: args.path}),
//       },
//     },
//   }),
//   queryDeduplication: true,
// });
