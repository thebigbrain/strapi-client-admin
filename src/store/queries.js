import { gql } from 'overmind-graphql';

export const apps = gql`
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
        collection_configs {
          id
          name
          collection_ops {
            id
            name
            title
            component
          }
        }
      }
    }
  }
`;