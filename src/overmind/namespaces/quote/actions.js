import {QUOTE_LIST} from 'graphql/queries';

export const updateQuoteBasic = async ({state, effects}) => {
  const {data} = await effects.client.query(QUOTE_LIST);
  if (!data) return;

  for (let v of data.quotes) {
    let i = state.quote.body.findIndex(e => e[1] === v.code);
    let d = state.quote.schema.map(k => v[k]);
    if (i === -1) state.quote.body.push(d);
    else state.quote.body[i] = d;
  }
};

export const updatePollInterval = ({state}) => {
  state.quote.pollInterval = 15000;
};