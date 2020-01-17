export function text ({id, value}) {
  id = `${id}_contains`;
  return [{id, value}];
}

export function between({id, value}) {
  let res = [];
  if (value[0] != null) res[0] = {id: `${id}_gt`, value: value[0]};
  if (value[1] != null) res[1] = {id: `${id}_lt`, value: value[1]};
  return res;
}

export const defaultHandler = text;