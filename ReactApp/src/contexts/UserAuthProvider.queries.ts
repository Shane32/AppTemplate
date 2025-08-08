import { gql } from "@shane32/graphql";

gql`
  query Me {
    me {
      id
      name
      firstName
      lastName
      roles
    }
  }
`;
