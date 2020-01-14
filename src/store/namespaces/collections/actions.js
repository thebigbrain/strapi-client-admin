// @ts-ignore
import {gql} from '@apollo/client';
// @ts-ignore
import { pipe, map, mutate } from "overmind";
import * as o from 'store/operators';

export const query = pipe(
  map((_ , q) => {
    return gql`${q}`;
  }),
  o.getQueryData(),
  mutate(({state}, data) => {
    // @ts-ignore
    Object.assign(state.collections, data);
  })
);