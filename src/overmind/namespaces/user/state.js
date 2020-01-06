export const state = {
  autoLogin: true,
  loginType: 'account',
  hasLogged: false,
  isLogging: false,
  loginError: null,
  captcha: null,
  roles: [],
  current: null,
  contracts: new Set()
}
