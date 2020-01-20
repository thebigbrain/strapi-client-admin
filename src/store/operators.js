import { mutate, map, pipe, catchError, debounce } from "overmind";
import objectPath from "object-path";

// export const handleQueryError = ({ state, actions }, error) => {
//   const { graphQLErrors, networkError } = error;

//   if (graphQLErrors) {
//     graphQLErrors.forEach(e => {
//       if (e.message.startsWith("Forbidden")) {
//         actions.user.logout();
//       }
//       state.graphQLErrors.push(e);
//     });
//   }

//   if (networkError) {
//     if (networkError.statusCode === 401) {
//       actions.user.logout();
//     } else {
//       state.error = networkError;
//     }
//   }
// };

// export const getQueryData = () =>
//   pipe(
//     map(async ({ effects }, options) => {
//       const r = await effects.client.query(options);
//       return r.data;
//     }),
//     catchError(handleQueryError)
//   );

export const search = () =>
  pipe(
    map(async ({ state, effects }, { collection, query='' }) => {
      let url = `${state.strapiServerOrigin}/globalsearch/${collection}?${query}`;
      let result = await effects.http.get(url);
      return { result, collection };
    }),
    catchError(({state}, error) => state.error = error)
  );

export const debouncePipe = (ms, ...args) => pipe(debounce(ms || 300), ...args);

export const setState = (path, value = null) =>
  mutate(({ state }, v) => {
    objectPath.set(state, path, value == null ? v : value);
  });

export const getState = path => ({ state }) => objectPath.get(state, path);
