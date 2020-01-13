import { GET_APP } from "graphql/queries";
// @ts-ignore
import {gql} from '@apollo/client';
// @ts-ignore
import { pipe, mutate, map } from "overmind";
import * as o from "./operators";

export const getApp = pipe(
  map(() => GET_APP),
  o.getQueryData(),
  mutate(async ({ actions }, data) => {
    if (data) {
      const app = data.apps[0];
      actions.layout.setLayout(app && app.layout);
      actions.layout.setRoutes(app && app.role && app.role.routes);
      return;
    }
  })
);

export const query = pipe(
  map((_ , q) => {
    return gql`${q}`;
  }),
  o.getQueryData()
);