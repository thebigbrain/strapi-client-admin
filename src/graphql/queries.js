// @ts-ignore
import {gql} from '@apollo/client';

export function generateQuery(name, schema) {
  const fields = ["id"].concat(schema);
  const q = `{${name}{${fields.join(" ")}}}`;
  return gql`
    ${q}
  `;
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

export const GET_APP = gql`
  query {
    apps {
      layout {
        locale
        collapsed
        route {
          id
          path
        }
        routePriorities
      }
      role {
        routes {
          id
          icon
          path
          name
          component
          priority
          props
          parent {
            id
            path
            name
          }
        }
      }
    }
  }
`;

export const GET_ROUTES = gql`
  query {
    routes {
      id
      icon
      path
      name
      component
      priority
      props
      parent {
        id
        path
        name
      }
    }
  }
`;

export const CREATE_MODEL = gql`
  mutation C_Model($data: ModelInput) {
    createModel(input: { data: $data }) {
      model {
        id
      }
    }
  }
`;
