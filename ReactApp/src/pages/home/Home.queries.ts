import { gql } from "@shane32/graphql";

gql`
  query TestQuery1 {
    me {
      id
      name
      email
    }
  }
`;

gql`
  query TestQuery2 {
    comment(id: "1") {
      id
    }
  }
`;
