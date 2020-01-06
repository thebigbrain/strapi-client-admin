import {gql} from 'apollo-boost';

export function generateQuery(name, schema) {
    const fields = ['id'].concat(schema);
    const q = `{${name}{${fields.join(' ')}}}`;
    return gql`${q}`;
}

export const QUOTE_LIST = gql`
    {
        quotes {
            id
            name
            code
            last_price
        }
    }
`;