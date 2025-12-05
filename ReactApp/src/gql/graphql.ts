/* eslint-disable */
import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** The `DateTimeOffset` scalar type represents a date, time and offset from UTC. `DateTimeOffset` expects timestamps to be formatted in accordance with the [ISO-8601](https://en.wikipedia.org/wiki/ISO_8601) standard. */
  DateTimeOffset: { input: string; output: string; }
};

export type AddPostInput = {
  content: Scalars['String']['input'];
  title: Scalars['String']['input'];
  userId: Scalars['Int']['input'];
};

export type Comment = {
  content: Scalars['String']['output'];
  createdAt: Scalars['DateTimeOffset']['output'];
  id: Scalars['ID']['output'];
  post: Post;
  postId: Scalars['ID']['output'];
  user: User;
  userId: Scalars['ID']['output'];
};

export type Mutation = {
  posts: PostMutation;
};

/** Information about pagination in a connection. */
export type PageInfo = {
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']['output']>;
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean']['output'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean']['output'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Post = {
  comments: Array<Comment>;
  content: Scalars['String']['output'];
  createdAt: Scalars['DateTimeOffset']['output'];
  id: Scalars['ID']['output'];
  title: Scalars['String']['output'];
  user: User;
  userId: Scalars['ID']['output'];
};

/** A connection from an object to a list of objects of type 'Post'. */
export type PostConnection = {
  /** A list of all of the edges returned in the connection. */
  edges: Array<PostEdge>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items: Array<Post>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount: Scalars['Int']['output'];
};

/** An edge in a connection from an object to another object of type 'Post'. */
export type PostEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node: Post;
};

export type PostMutation = {
  add: Post;
  delete: Scalars['Boolean']['output'];
  update: Post;
};


export type PostMutationAddArgs = {
  input: AddPostInput;
};


export type PostMutationDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type PostMutationUpdateArgs = {
  id: Scalars['ID']['input'];
  input: UpdatePostInput;
};

export type Query = {
  comment: Comment;
  me: User;
  post: Post;
  posts: PostConnection;
  test?: Maybe<Scalars['String']['output']>;
  user: User;
  users: UserConnection;
};


export type QueryCommentArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPostArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPostsArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  before?: InputMaybe<Scalars['ID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};


export type QueryUsersArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  before?: InputMaybe<Scalars['ID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export enum Role {
  Admin = 'ADMIN',
  Operator = 'OPERATOR',
  SysAdmin = 'SYS_ADMIN'
}

export type UpdatePostInput = {
  content: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

export type User = {
  email?: Maybe<Scalars['String']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  roles: Array<Role>;
};

/** A connection from an object to a list of objects of type 'User'. */
export type UserConnection = {
  /** A list of all of the edges returned in the connection. */
  edges: Array<UserEdge>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items: Array<User>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount: Scalars['Int']['output'];
};

/** An edge in a connection from an object to another object of type 'User'. */
export type UserEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node: User;
};

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { me: { id: string, name?: string | null, firstName?: string | null, lastName?: string | null, roles: Array<Role> } };

export type TestQuery1QueryVariables = Exact<{ [key: string]: never; }>;


export type TestQuery1Query = { me: { id: string, name?: string | null, email?: string | null } };

export type TestQuery2QueryVariables = Exact<{ [key: string]: never; }>;


export type TestQuery2Query = { comment: { id: string } };

export type TestQuery3QueryVariables = Exact<{ [key: string]: never; }>;


export type TestQuery3Query = { post: { id: string, title: string, content: string, userId: string } };

export type Fragment1Fragment = { id: string, title: string, content: string, userId: string };

export type Fragment2Fragment = { id: string, title: string, content: string, userId: string };

export type TestQuery4QueryVariables = Exact<{ [key: string]: never; }>;


export type TestQuery4Query = { posts: { edges: Array<{ node: { id: string, title: string, content: string, userId: string } }> } };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}
export const Fragment1FragmentDoc = new TypedDocumentString(`
    fragment Fragment1 on Post {
  id
  title
  content
  userId
}
    `, {"fragmentName":"Fragment1"}) as unknown as TypedDocumentString<Fragment1Fragment, unknown>;
export const Fragment2FragmentDoc = new TypedDocumentString(`
    fragment Fragment2 on Post {
  id
  title
  content
  userId
}
    `, {"fragmentName":"Fragment2"}) as unknown as TypedDocumentString<Fragment2Fragment, unknown>;
export const MeDocument = {"__meta__":{"hash":"Me_i8Eh1RVt"}} as unknown as TypedDocumentString<MeQuery, MeQueryVariables>;
export const TestQuery1Document = {"__meta__":{"hash":"TestQuery1_iDZ2ixhE"}} as unknown as TypedDocumentString<TestQuery1Query, TestQuery1QueryVariables>;
export const TestQuery2Document = {"__meta__":{"hash":"TestQuery2_pysM48k+"}} as unknown as TypedDocumentString<TestQuery2Query, TestQuery2QueryVariables>;
export const TestQuery3Document = {"__meta__":{"hash":"TestQuery3_Q2hGzi+D"}} as unknown as TypedDocumentString<TestQuery3Query, TestQuery3QueryVariables>;
export const TestQuery4Document = {"__meta__":{"hash":"TestQuery4_XTpPqEkU"}} as unknown as TypedDocumentString<TestQuery4Query, TestQuery4QueryVariables>;