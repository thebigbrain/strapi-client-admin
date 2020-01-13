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

export const sortRouteTree = (priorities, root) => {
  if (!priorities) return;

  let priors = new Map();
  priorities.split(',').forEach((v, i) => priors.set(v, i));

  const sort = (arr) => {
    arr.sort((r1, r2) => {
      if (r1.routes) sort(r1.routes);
      if (r2.routes) sort(r2.routes);

      let p1 = priors.get(r1.id), p2 = priors.get(r2.id);
      if (p1 == null) p1 = Infinity;
      if (p2 == null) p2 = Infinity;
      return p1 - p2;
    });
  };
  sort(root.routes);
};
