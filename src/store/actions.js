import { pipe, mutate, map } from "overmind";

export const getApp = pipe(
  map(async ({ effects }) => {
    const { apps } = await effects.queries.apps();
    return apps;
  }),
  mutate(async ({ state, actions }, apps) => {
    if (apps) {
      const app = apps[0];
      actions.layout.setLayout(app && app.layout);
      if (app && app.role) {
        actions.layout.setRoutes(app && app.role && app.role.routes);
        state.collectionConfigs = (app.role.collection_configs || []).reduce((prev, cur) => {
          return Object.assign(prev, {[cur.name]: cur.collection_ops});
        }, {});
      }
    }
  })
);
