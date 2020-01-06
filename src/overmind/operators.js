import {mutate} from 'overmind';
import objectPath from 'object-path';


export const setState = (path, value = null) =>
  mutate(({state}, v) => {
    objectPath.set(state, path, value == null ? v : value);
  });

export const getState = (path) => ({state}) => objectPath.get(state, path);

export const withLoadApp = (
  continueAction,
) => async (context, value) => {
  const {effects, state, actions} = context;

  if (state.hasLoadedApp && continueAction) {
    await continueAction(context, value);
    return;
  }
  if (state.hasLoadedApp) {
    return;
  }

  state.isAuthenticating = true;
  state.jwt = await effects.jwt.get() || null;

  if (state.jwt) {
    try {
      await effects.jwt.reAuthenticate();
      state.user = await effects.api.getCurrentUser();
    } catch (error) {
      console.log(error);
      effects.notificationToast.error(
        'Your session seems to be expired, please log in again...',
      );
      effects.jwt.reset();
    }
  } else {
    effects.jwt.reset();
  }

  if (continueAction) {
    await continueAction(context, value);
  }

  state.hasLoadedApp = true;
  state.isAuthenticating = false;
};
