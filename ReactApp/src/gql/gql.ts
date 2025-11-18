/* eslint-disable */
import * as types from './graphql';



/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query Me {\n    me {\n      id\n      name\n      firstName\n      lastName\n      roles\n    }\n  }\n": typeof types.MeDocument,
    "\n  query TestQuery1 {\n    me {\n      id\n      name\n      email\n    }\n  }\n": typeof types.TestQuery1Document,
    "\n  query TestQuery2 {\n    comment(id: \"1\") {\n      id\n    }\n  }\n": typeof types.TestQuery2Document,
    "\n  query TestQuery3 {\n    post(id: \"1\") {\n      ...Fragment1\n    }\n  }\n  fragment Fragment1 on Post {\n    id\n    title\n    content\n    userId\n  }\n": typeof types.TestQuery3Document,
    "\n  fragment Fragment2 on Post {\n    id\n    title\n    content\n    userId\n  }\n": typeof types.Fragment2FragmentDoc,
    "\n  query TestQuery4 {\n    posts {\n      edges {\n        node {\n          ...Fragment2\n        }\n      }\n    }\n  }\n\n  \n": typeof types.TestQuery4Document,
};
const documents: Documents = {
    "\n  query Me {\n    me {\n      id\n      name\n      firstName\n      lastName\n      roles\n    }\n  }\n": types.MeDocument,
    "\n  query TestQuery1 {\n    me {\n      id\n      name\n      email\n    }\n  }\n": types.TestQuery1Document,
    "\n  query TestQuery2 {\n    comment(id: \"1\") {\n      id\n    }\n  }\n": types.TestQuery2Document,
    "\n  query TestQuery3 {\n    post(id: \"1\") {\n      ...Fragment1\n    }\n  }\n  fragment Fragment1 on Post {\n    id\n    title\n    content\n    userId\n  }\n": types.TestQuery3Document,
    "\n  fragment Fragment2 on Post {\n    id\n    title\n    content\n    userId\n  }\n": types.Fragment2FragmentDoc,
    "\n  query TestQuery4 {\n    posts {\n      edges {\n        node {\n          ...Fragment2\n        }\n      }\n    }\n  }\n\n  \n": types.TestQuery4Document,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Me {\n    me {\n      id\n      name\n      firstName\n      lastName\n      roles\n    }\n  }\n"): typeof import('./graphql').MeDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query TestQuery1 {\n    me {\n      id\n      name\n      email\n    }\n  }\n"): typeof import('./graphql').TestQuery1Document;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query TestQuery2 {\n    comment(id: \"1\") {\n      id\n    }\n  }\n"): typeof import('./graphql').TestQuery2Document;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query TestQuery3 {\n    post(id: \"1\") {\n      ...Fragment1\n    }\n  }\n  fragment Fragment1 on Post {\n    id\n    title\n    content\n    userId\n  }\n"): typeof import('./graphql').TestQuery3Document;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment Fragment2 on Post {\n    id\n    title\n    content\n    userId\n  }\n"): typeof import('./graphql').Fragment2FragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query TestQuery4 {\n    posts {\n      edges {\n        node {\n          ...Fragment2\n        }\n      }\n    }\n  }\n\n  \n"): typeof import('./graphql').TestQuery4Document;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
