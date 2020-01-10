import {buildRouteTree} from '../../utils';

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
  
  root.routes.sort((v1, v2) => v1.priority - v2.priority);
  state.layout.route = root;
};
