import { gql } from "@shane32/graphql";

gql`
  query TestQuery3 {
    post(id: "1") {
      ...Fragment1
    }
  }
  fragment Fragment1 on Post {
    id
    title
    content
    userId
  }
`;

gql`
  fragment Fragment2 on Post {
    id
    title
    content
    userId
  }
`;

gql`
  query TestQuery4 {
    posts {
      edges {
        node {
          ...Fragment2
        }
      }
    }
  }
`;
