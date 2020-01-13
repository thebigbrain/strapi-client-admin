import { client } from "graphql/client";
import { cloneDeep } from "lodash-es";

export const query = async (query, option) => {
  let r = await client.query({ query }, option);
  r.data = cloneDeep(r.data);
  return r;
};

export function reset() {
  client.resetStore();
}