import {buildRouteTree, sortRouteTree} from '../../utils';

export const toggleCollapsed = ({ state }) => {
  state.layout.collapsed = !state.layout.collapsed;
};

export const setLayout = ({ state, actions }, layout) => {
  Object.assign(state.layout, layout);
};

export const setRoutes = ({ state }, routes = []) => {
  if (routes.length < 3) {
    state.layout.collapsed = true;
  }

  let tree = buildRouteTree(routes);
  let root = tree.get(state.layout.route.id);
  
  sortRouteTree(state.layout.routePriorities, root);
  state.layout.route = root;
};
