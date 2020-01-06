export const setWorkspaceItem = ({ state }, { item }) => {
  state.workspace.openedWorkspaceItem = item
}

export const toggleCurrentWorkspaceItem = ({ state }) => {
  state.workspace.workspaceHidden = !state.workspace.workspaceHidden
}

export const setWorkspaceHidden = (
  { state },
  { hidden },
) => {
  state.workspace.workspaceHidden = hidden
}
