export * from './items'

export const resizingStarted = ({state}) => {
  state.editor.isResizing = true
}

export const resizingStopped = ({state}) => {
  state.editor.isResizing = false
}
