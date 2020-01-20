import { gql } from 'overmind-graphql';

export const createModel = gql`
  mutation create_model($data: ModelInput) {
    createModel(input: { data: $data }) {
      model {
        id
      }
    }
  }
`;