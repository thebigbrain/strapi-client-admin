import {generateQuery} from 'graphql/queries';

export const state = {
  name: 'quotes',
  schema: ['name', 'code', 'last_price'],
  header: ['品种', '标的', '标的价格', '买价', '卖价', '买价%', '卖价%', '买价vol', '卖价vol'],
  body: [],
  queryList: (state) => {
    return generateQuery(state.name, state.schema)
  },
  pollInterval: 3000,
};