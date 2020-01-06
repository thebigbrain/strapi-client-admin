import {client} from 'graphql/client';

export const query = async (query, option) => {
  return await client.query({query}, option);
};