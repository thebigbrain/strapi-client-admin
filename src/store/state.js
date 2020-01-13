const location = window.location;

export const state = {
  graphQLErrors: [],
  error: null,
  strapiServerOrigin: `${location.protocol}//${location.hostname}:1337`
};
