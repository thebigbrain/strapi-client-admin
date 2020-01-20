const location = window.location;

export const state = {
  token: localStorage.getItem("jwt"),
  graphQLErrors: [],
  error: null,
  strapiServerOrigin: `${location.protocol}//${location.hostname}:1337`,
  collectionConfigs: {},
};
