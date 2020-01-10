import { GET_APP } from "graphql/queries";
import { pipe, mutate } from "overmind";
import * as o from "./operators";

export const getApp = pipe(
  o.getQueryData(GET_APP),
  mutate(async ({ actions, state, effects }, data) => {
    if (data) {
      const app = data.apps[0];
      actions.layout.setLayout(app && app.layout);
      actions.layout.setRoutes(app && app.role && app.role.routes);
      return;
    }
  })
);
