export const buildRouteTree = (arr, tree = new Map()) => {
  let missed = [];
  for (let r of arr) {
    if (tree.has(r.id)) {
      continue;
    }

    if (r.parent) {
      let parent = tree.get(r.parent.id);
      if (!parent) {
        missed.push(r);
      } else {
        tree.set(r.id, r);
        parent.routes = parent.routes || [];
        parent.routes.push(r);
      }
    } else {
      tree.set(r.id, r);
    }
  }

  if (missed.length > 0 && arr.length > missed.length) {
    buildRouteTree(missed, tree);
  }

  return tree;
}

export const sortRouteTree = (priorities, routes) => {

};
