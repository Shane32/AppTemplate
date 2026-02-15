---
name: graphql-client
description: Create or modify client-side GraphQL queries and mutations for the React application.
---

# GraphQL Client-side Query Design Rules

When the user requests new or modified GraphQL queries or mutations for the React application, the following rules **MUST** be followed. This pattern is **CRITICAL** for the application to function in production.

## Critical Architecture Rules

### 1. Separation of Queries and Components

**GraphQL queries and mutations MUST be separated from component code.** This separation is required for the production build to work correctly with persisted queries.

### 2. Unique Operation Names

**Every GraphQL operation (query, mutation, subscription) MUST have a unique name across the entire codebase.** Operation names are global identifiers and duplicates will cause build failures and runtime errors.

**Examples:**

- ✅ `GetUserProfile`, `GetPostById`, `GetCommentsByPost` - All unique
- ❌ `GetData`, `GetData`, `FetchInfo` - Duplicate `GetData` will fail

### What This Means

1. **Query Files** (`.queries.ts`) contain ONLY GraphQL operations - no other code
2. **Component Files** (`.tsx` or `.ts`) contain ONLY application logic - no GraphQL literals
3. **Generated Files** (`.queries.g.ts`) are auto-generated and provide the bridge between them
4. **NEVER reference `ReactApp/src/gql/gql.ts`** - this file should not be imported
5. **RARELY reference `ReactApp/src/gql/graphql.ts`** - only when `.g.ts` files cannot be used

**Violation of this pattern will cause production builds to fail.**

## File Structure Pattern

For any component or module that needs GraphQL queries:

```
src/pages/home/
├── Home.tsx              # Component code - imports from .g.ts
├── Home.queries.ts       # GraphQL operations ONLY
└── Home.queries.g.ts     # Auto-generated - DO NOT EDIT
```

Or for contexts:

```
src/contexts/
├── UserAuthProvider.tsx
├── UserAuthProvider.queries.ts
└── UserAuthProvider.queries.g.ts
```

## Creating Query Files

### Step 1: Create the `.queries.ts` File

Query files must:

- Be named with the `.queries.ts` suffix
- Import `gql` from `@shane32/graphql`
- Contain ONLY GraphQL operations (queries, mutations, fragments)
- **NOT export anything** - codegen handles exports
- **Each operation MUST have a unique name** across the entire codebase

**Example: `Home.queries.ts`**

```typescript
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
```

### Step 2: Wait for Codegen

The GraphQL Code Generator runs automatically in the background during development. It will:

1. Detect your new `.queries.ts` file
2. Generate a corresponding `.queries.g.ts` file
3. Generate TypeScript types in `src/gql/`

**To verify codegen has run:**

- Check for the presence of the `.queries.g.ts` file next to your `.queries.ts` file
- The `.g.ts` file should export document objects for your queries

**If codegen hasn't run automatically:**

```bash
npm run codegen
```

**During development**, codegen runs in watch mode:

```bash
npm run dev  # Runs both Vite and codegen in watch mode
```

### Step 3: Import and Use in Components

**CRITICAL**: Component files must:

- Import from the `.queries.g.ts` file (NOT the `.queries.ts` file)
- Never contain GraphQL literals (no `gql` template strings)
- Never import the `.queries.ts` file directly

**Example: `Home.tsx`**

```typescript
import { useQuery } from "@shane32/graphql";
import * as Queries from "./Home.queries.g";

function Home() {
  // Use the generated document
  const { data, loading, error } = useQuery(Queries.TestQuery1Document);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Welcome, {data?.me.name}</h1>
      <p>Email: {data?.me.email}</p>
    </div>
  );
}

export default Home;
```

## Using useQuery and useMutation

### useQuery - For Data Fetching

Use `useQuery` for fetching data. **Always use type inference** - do not specify type parameters:

```typescript
import { useQuery } from "@shane32/graphql";
import * as Queries from "./UserProfile.queries.g";

function UserProfile({ userId }: { userId: string }) {
  // ✅ Type inference - data, loading, error are all properly typed
  const { data, loading, error, refetch } = useQuery(
    Queries.GetUserProfileDocument,
    { variables: { id: userId } }
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>{data?.user.name}</h1>
      <button onClick={() => refetch()}>Refresh</button>
    </div>
  );
}
```

### useMutation - For Mutations and On-Demand Calls

Use `useMutation` for:

- Mutations (create, update, delete operations)
- Any on-demand GraphQL call that shouldn't execute immediately

**Always use type inference** - do not specify type parameters:

```typescript
import { useMutation } from "@shane32/graphql";
import * as Queries from "./PostEditor.queries.g";

function PostEditor() {
  // ✅ useMutation returns an async function in an array
  // The function will throw if there's a GraphQL error
  const [addPost] = useMutation(Queries.AddPostDocument);

  const handleSubmit = async (title: string, content: string) => {
    try {
      // Variables are type-checked based on the mutation definition
      const result = await addPost({
        variables: {
          input: {
            title,
            content,
            userId: 1
          }
        }
      });

      // result.data is properly typed
      console.log("Created post:", result.data?.posts.add.id);
    } catch (error) {
      // GraphQL errors are thrown as exceptions
      console.error("Failed to create post:", error);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit("Title", "Content");
    }}>
      <button type="submit">Create Post</button>
    </form>
  );
}
```

**Important**: `useMutation` returns only an async function in the array. Unlike `useQuery`, it does not return loading/error state. The mutation function will **throw an exception** if there's a GraphQL error, so use try/catch for error handling.

**useMutation can also be used for on-demand queries:**

```typescript
import { useMutation } from "@shane32/graphql";
import * as Queries from "./Search.queries.g";

function SearchComponent() {
  // Use useMutation for queries that should only run on-demand
  const [search] = useMutation(Queries.SearchPostsDocument);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (term: string) => {
    setLoading(true);
    try {
      const result = await search({ variables: { searchTerm: term } });
      setData(result.data);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input onChange={(e) => handleSearch(e.target.value)} />
      {loading && <div>Searching...</div>}
      {data?.posts.items.map(post => <div key={post.id}>{post.title}</div>)}
    </div>
  );
}
```

## Query Patterns

### Basic Query

```typescript
// UserProfile.queries.ts
import { gql } from "@shane32/graphql";

gql`
  query GetUserProfile($id: ID!) {
    user(id: $id) {
      id
      name
      email
      roles
    }
  }
`;
```

```typescript
// UserProfile.tsx
import { useQuery } from "@shane32/graphql";
import * as Queries from "./UserProfile.queries.g";

function UserProfile({ userId }: { userId: string }) {
  // ✅ Type inference
  const { data } = useQuery(Queries.GetUserProfileDocument, {
    variables: { id: userId }
  });

  return <div>{data?.user.name}</div>;
}
```

### Mutation

```typescript
// PostEditor.queries.ts
import { gql } from "@shane32/graphql";

gql`
  mutation AddPost($input: AddPostInput!) {
    posts {
      add(input: $input) {
        id
        title
        content
        createdAt
        user {
          id
          name
        }
      }
    }
  }
`;

gql`
  mutation UpdatePost($id: ID!, $input: UpdatePostInput!) {
    posts {
      update(id: $id, input: $input) {
        id
        title
        content
      }
    }
  }
`;
```

```typescript
// PostEditor.tsx
import { useMutation } from "@shane32/graphql";
import * as Queries from "./PostEditor.queries.g";

function PostEditor() {
  const [addPost] = useMutation(Queries.AddPostDocument);
  const [updatePost] = useMutation(Queries.UpdatePostDocument);

  const handleAdd = async () => {
    const result = await addPost({
      variables: {
        input: {
          title: "New Post",
          content: "Content here",
          userId: 1
        }
      }
    });
    console.log("Created:", result.data?.posts.add);
  };

  const handleUpdate = async (id: string) => {
    await updatePost({
      variables: {
        id,
        input: {
          title: "Updated Title",
          content: "Updated Content"
        }
      }
    });
  };

  return (
    <div>
      <button onClick={handleAdd}>Add Post</button>
      <button onClick={() => handleUpdate("1")}>Update Post</button>
    </div>
  );
}
```

### Using Fragments

Fragments can be defined in the same file or shared across multiple query files:

```typescript
// Post.queries.ts
import { gql } from "@shane32/graphql";

gql`
  fragment PostFields on Post {
    id
    title
    content
    userId
    createdAt
  }
`;

gql`
  query GetPost($id: ID!) {
    post(id: $id) {
      ...PostFields
      user {
        id
        name
      }
    }
  }
`;

gql`
  query GetPosts {
    posts {
      items {
        ...PostFields
      }
      totalCount
    }
  }
`;
```

### Pagination with Connections

```typescript
// PostList.queries.ts
import { gql } from "@shane32/graphql";

gql`
  query GetPostsConnection($first: Int, $after: ID) {
    posts(first: $first, after: $after) {
      edges {
        node {
          id
          title
          content
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;
```

```typescript
// PostList.tsx
import { useQuery } from "@shane32/graphql";
import * as Queries from "./PostList.queries.g";
import { useState } from "react";

function PostList() {
  const [cursor, setCursor] = useState<string | undefined>();

  const { data, loading } = useQuery(Queries.GetPostsConnectionDocument, {
    variables: { first: 10, after: cursor }
  });

  const loadMore = () => {
    if (data?.posts.pageInfo.hasNextPage) {
      setCursor(data.posts.pageInfo.endCursor);
    }
  };

  return (
    <div>
      {data?.posts.edges.map(edge => (
        <div key={edge.node.id}>
          <h3>{edge.node.title}</h3>
          <p>{edge.node.content}</p>
        </div>
      ))}
      {data?.posts.pageInfo.hasNextPage && (
        <button onClick={loadMore} disabled={loading}>
          Load More
        </button>
      )}
    </div>
  );
}
```

## How Codegen Works

### Schema Source

The GraphQL Code Generator pulls the schema from:

```
../Tests/Infrastructure/ServerTests.Introspection.approved.graphql
```

This file is generated by the C# test suite when you run:

```bash
dotnet test
```

**Important**: If you've added new server-side graphs, you must:

1. Run the C# tests to update the schema
2. Approve the introspection test changes
3. The updated schema will then be available to codegen

### Codegen Configuration

The codegen configuration is in `ReactApp/codegen.ts`:

```typescript
const config: CodegenConfig = {
  schema: [{ [schemaUrl]: { handleAsSDL: true } }],
  documents: "./src/**/!(*.g).{ts,tsx}", // Scans all .ts/.tsx except .g.ts files
  ignoreNoDocuments: true,
  generates: {
    [`./src/gql/`]: {
      preset: "client",
      plugins: ["@shane32/graphql-codegen-near-operation-file-plugin"],
      // ... generates TypeScript types and .g.ts files
    },
  },
};
```

### Generated Files

Codegen generates two types of files:

1. **`.queries.g.ts` files** - Next to each `.queries.ts` file

   ```typescript
   // Home.queries.g.ts (auto-generated)
   export { TestQuery1Document, TestQuery2Document } from "../../gql/graphql";
   ```

2. **`src/gql/` directory** - Central type definitions
   - `graphql.ts` - All TypeScript types and document definitions
   - `index.ts` - Re-exports
   - `persisted-documents.json` - Query hashes for production

## Production Considerations

### Persisted Queries

In production, the application uses **persisted queries** for security and performance:

- Only queries defined in `.queries.ts` files are allowed
- Queries are identified by their hash, not their full text
- The `persisted-documents.json` file contains the mapping
- Arbitrary queries from clients are rejected

**This is why the separation pattern is critical** - queries must be known at build time.

### Build Process

The production build process:

1. Cleans all `.g.ts` files
2. Runs codegen with production config
3. Generates persisted query hashes
4. Compiles TypeScript
5. Builds the Vite bundle

```bash
npm run build
```

## Common Mistakes to Avoid

### ❌ DO NOT: Use Duplicate Operation Names

```typescript
// File1.queries.ts
gql`
  query GetUser {
    # ❌ This name is used
    me {
      id
      name
    }
  }
`;

// File2.queries.ts
gql`
  query GetUser {
    # ❌ DUPLICATE - Will cause errors
    user(id: "1") {
      id
      name
    }
  }
`;
```

**Why this fails:**

- Operation names are global identifiers in GraphQL
- Codegen will generate conflicting TypeScript exports
- Persisted queries rely on unique operation names
- Build will fail or runtime errors will occur

**Solution:** Use descriptive, unique names:

```typescript
// File1.queries.ts
gql`
  query GetCurrentUser {
    # ✅ Unique and descriptive
    me {
      id
      name
    }
  }
`;

// File2.queries.ts
gql`
  query GetUserById {
    # ✅ Unique and descriptive
    user(id: "1") {
      id
      name
    }
  }
`;
```

### ❌ DO NOT: Put GraphQL in Component Files

```typescript
// WRONG - This will break production builds
import { gql, useQuery } from "@shane32/graphql";

function MyComponent() {
  const { data } = useQuery(gql`
    query {
      me {
        id
        name
      }
    }
  `);
  // ...
}
```

### ❌ DO NOT: Import from `.queries.ts` Files

```typescript
// WRONG - Import from .g.ts, not .queries.ts
import * as Queries from "./Home.queries"; // ❌
```

### ❌ DO NOT: Export from `.queries.ts` Files

```typescript
// WRONG - Don't export anything from query files
import { gql } from "@shane32/graphql";

export const MyQuery = gql`...`; // ❌
```

### ✅ DO: Follow the Pattern

```typescript
// Home.queries.ts - GraphQL ONLY
import { gql } from "@shane32/graphql";

gql`
  query GetUser {
    me {
      id
      name
    }
  }
`;
```

```typescript
// Home.tsx - Import from .g.ts
import { useQuery } from "@shane32/graphql";
import * as Queries from "./Home.queries.g";

function Home() {
  const { data } = useQuery(Queries.GetUserDocument);
  return <div>{data?.me.name}</div>;
}
```

## Troubleshooting

### `.queries.g.ts` File Not Generated

1. Check that codegen is running:

   ```bash
   npm run dev  # Should show codegen in watch mode
   ```

2. Manually run codegen:

   ```bash
   npm run codegen
   ```

3. Check for syntax errors in your `.queries.ts` file

### Type Errors After Adding New Queries

1. Ensure the server schema is up to date:

   ```bash
   cd ..
   dotnet test
   ```

2. Regenerate client types:
   ```bash
   cd ReactApp
   npm run codegen
   ```

### Production Build Fails

1. Verify all GraphQL is in `.queries.ts` files
2. Verify components import from `.queries.g.ts` files
3. Run a clean build:
   ```bash
   npm run build
   ```

## Summary

**The Golden Rules:**

1. ✅ GraphQL operations go in `.queries.ts` files ONLY
2. ✅ Components import from `.queries.g.ts` files ONLY
3. ✅ Never mix GraphQL literals with component code
4. ✅ **Every operation MUST have a unique name across the entire codebase**
5. ✅ Assume codegen is always running in development
6. ✅ Check for `.queries.g.ts` file to verify codegen ran
7. ✅ Run `npm run codegen` if needed manually
8. ✅ Update server schema with `dotnet test` before adding new queries

**This pattern is non-negotiable for production deployments.**
