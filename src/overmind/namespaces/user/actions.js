export const login = async ({state, effects}) => {
  try {
    let response = await effects.http.post(`${state.strapiServerOrigin}/auth/local`, {
      identifier: 'test',
      password: 'test111111',
    });

    Object.assign(state.user, response.data);

    effects.jwt.store(response.data.jwt);
    effects.browser.reload();
  } catch(error) {
    console.log('An error occurred:', error);
  }
};

export const loginWithGithub = async ({state, effects}) => {
  const popup = effects.browser.openPopup(
    `${state.strapiServerOrigin}/connect/github`,
    'sign in',
  );

  return effects.browser
    .waitForMessage('signin')
    .then(data => {
      Object.assign(state.user, data);
      popup.close();

      if (state.user.error) {
        throw state.user.error;
      } else {
        effects.jwt.store(state.user.jwt);
        effects.browser.reload();
      }
    });
};

export const logout = ({state, effects}) => {
  state.user = {};
  effects.jwt.reset();
  effects.browser.reload();
};