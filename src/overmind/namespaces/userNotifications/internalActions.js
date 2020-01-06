export const initialize = async ({state, effects, actions}) => {
  const {unread} = await effects.notifications.joinChannel(state.user.id)

  state.userNotifications.connected = true
  state.userNotifications.unreadCount = unread

  effects.notifications.listen(
    actions.userNotifications.internal.messageReceived,
  )
}

export const messageReceived = (
  {state},
  message,
) => {
  switch (message.event) {
    case 'new-notification': {
      if (!state.userNotifications.notificationsOpened) {
        state.userNotifications.unreadCount++
      }
    }
  }
}
