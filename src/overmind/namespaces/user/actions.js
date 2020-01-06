import {pipe} from 'overmind'
import * as o from './operators'
import {setState,} from '../../operators'

export const reAuthenticate = pipe(
  o.reAuthenticate(),
  pipe(
    setState('user.hasLogged', true),
    setState('isLanding', false),
    o.getRoles()
  ),
  o.handleAuthError()
)

export const login = pipe(
  setState(`user.hasLogged`, false),
  setState(`user.isLogging`, true),
  o.login(),
  pipe(
    o.setAuthorityRoles(),
    setState('user.hasLogged', true),
    o.getRoles(),
    o.handleLoginSuccess(),
  ),
  o.handleLoginError(),
  setState(`user.isLogging`, false),
)

export const toLogin = ({effects}) => effects.router.toLogin()

export const getCaptcha = async ({state}) => {
  state.user.captcha = Math.random().toString().substr(2, 4)
}
