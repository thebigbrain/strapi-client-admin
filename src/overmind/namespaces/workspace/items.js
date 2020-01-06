import getTemplate from '@csb/common/lib/templates'


const PROJECT = {
  id: 'project',
  name: 'Sandbox Info',
}

const PROJECT_TEMPLATE = {
  ...PROJECT,
  name: 'Template Info',
}

const PROJECT_SUMMARY = {
  id: 'project-summary',
  name: 'Sandbox Info',
  hasCustomHeader: true,
}

const FILES = {
  id: 'files',
  name: 'Explorer',
  hasCustomHeader: true,
  defaultOpen: true,
}

const GITHUB = {
  id: 'github',
  name: 'GitHub',
  showAsDisabledIfHidden: true,
}

const DEPLOYMENT = {
  id: 'deploy',
  name: 'Deployment',
  showAsDisabledIfHidden: true,
}

const CONFIGURATION = {
  id: 'config',
  name: 'Configuration Files',
}

const LIVE = {
  id: 'live',
  name: 'Live',
  showAsDisabledIfHidden: true,
}

const SERVER = {
  id: 'server',
  name: 'Server Control Panel',
}

export function getDisabledItems({state}) {
  const {currentSandbox} = state.editor

  if (!currentSandbox.owned || !state.isLoggedIn) {
    return [GITHUB, DEPLOYMENT, LIVE]
  }

  return []
}

export function getWorkspaceItems({state}) {
  if (
    state.live.isLive &&
    !(
      state.live.isOwner ||
      (state.user &&
        state.live &&
        state.live.roomInfo &&
        state.live.roomInfo.ownerIds.indexOf(state.user.id) > -1)
    )
  ) {
    return [FILES, LIVE]
  }

  const {currentSandbox} = state.editor

  if (!currentSandbox.owned) {
    return [PROJECT_SUMMARY, CONFIGURATION]
  }

  const isCustomTemplate = !!currentSandbox.customTemplate
  const items = [
    isCustomTemplate ? PROJECT_TEMPLATE : PROJECT,
    FILES,
    CONFIGURATION,
  ]

  if (state.isLoggedIn && currentSandbox) {
    const templateDef = getTemplate(currentSandbox.template)
    if (templateDef.isServer) {
      items.push(SERVER)
    }
  }

  if (state.isLoggedIn && currentSandbox && !currentSandbox.git) {
    items.push(GITHUB)
  }

  if (state.isLoggedIn) {
    items.push(DEPLOYMENT)
  }

  if (state.isLoggedIn) {
    items.push(LIVE)
  }

  return items
}
