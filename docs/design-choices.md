# Design Choices

This document explains the key technology selections made in this application template, covering both frontend and backend stack choices and the rationale behind them.

## Frontend Stack

### React

React 18.3+ is used as the UI framework.

**Rationale:**

- Industry-standard library with extensive ecosystem and community support
- Component-based architecture promotes reusability and maintainability
- Excellent TypeScript integration for type safety
- Strong performance with virtual DOM and concurrent features
- Wide availability of developers familiar with React

### Vite

Vite 5.4+ is used as the build tool and development server.

**Rationale:**

- Lightning-fast hot module replacement (HMR) during development
- Optimized production builds using Rollup
- Native ES modules support for faster development experience
- Simple configuration with sensible defaults
- Excellent TypeScript support out of the box

### TypeScript

TypeScript 5.9+ is used throughout the frontend codebase.

**Rationale:**

- Compile-time type safety catches errors before runtime
- Superior IDE support with autocomplete and refactoring tools
- Self-documenting code through type annotations
- Seamless integration with GraphQL code generation for end-to-end type safety
- Industry standard for modern JavaScript development

### GraphQL Code Generation

GraphQL Code Generator (`@graphql-codegen/cli`) with custom near-operation-file plugin (`@shane32/graphql-codegen-near-operation-file-plugin`).

**Rationale:**

- Generates TypeScript types directly from GraphQL operations
- Provides compile-time type safety across the entire stack
- Eliminates manual type definitions and keeps them synchronized with the backend schema
- Co-locates generated types with query definitions for better organization
- Catches breaking changes at compile time when the backend schema changes

**Implementation Details:**

- Uses the backend's introspection schema from approval tests as the source of truth
- Generates types in `.g.ts` files next to their corresponding `.queries.ts` files
- Runs automatically during development via watch mode
- See [`codegen.ts`](../ReactApp/codegen.ts) for configuration

### No Server-Side Rendering (SSR)

The application uses client-side rendering (CSR) as a Single Page Application (SPA), not server-side rendering.

**Rationale:**

- **Simpler deployment:** Single artifact deployment to Azure App Service without Node.js runtime requirements
- **Better separation of concerns:** Clear boundary between API backend and frontend application
- **Reduced complexity:** No need to manage server-side rendering infrastructure or hydration issues
- **Optimal for authenticated applications:** Most pages require authentication, negating SEO benefits of SSR
- **Better developer experience:** Faster development with Vite's HMR and simpler debugging

**Trade-offs:**

- Slower initial page load compared to SSR (mitigated by code splitting and lazy loading)
- Limited SEO for public pages (not a concern for authenticated applications)
- Requires JavaScript to be enabled in the browser

**When SSR Might Be Needed:**

- Public-facing marketing pages requiring SEO
- Applications with significant public content
- Strict performance requirements for initial page load

For such cases, consider deploying a separate Next.js or Remix application for public pages while keeping the authenticated SPA separate.

### @shane32/graphql over Apollo Client

[`@shane32/graphql`](https://www.npmjs.com/package/@shane32/graphql) is used for GraphQL client operations instead of Apollo Client.

**Rationale:**

- **Lightweight:** Minimal bundle size with no unnecessary features
- **Extremely fast:** Doesn't parse GraphQL responses (not required for caching), resulting in significantly faster query execution
- **Simple API:** Straightforward fetch-based implementation without complex caching layers
- **Persisted queries support:** Built-in support for the persisted query pattern used by the backend
- **TypeScript-first:** Designed to work seamlessly with GraphQL Code Generator
- **No lock-in:** Uses standard GraphQL queries without proprietary extensions
- **Sufficient for most SPAs:** Provides everything needed for typical authenticated applications

**What It Provides:**

- GraphQL query/mutation execution
- Subscription support via WebSockets
- Automatic authentication token handling
- Error handling and response parsing
- Persisted query hash generation
- Document-level caching (when needed)

**What It Doesn't Provide (and why that's okay):**

- Response parsing: Skips parsing for maximum performance since normalized caching isn't needed
- Normalized caching: Most authenticated SPAs don't benefit from complex caching
- Optimistic updates: Can be implemented at the component level when needed
- Local state management: Use React Context or dedicated state management libraries

**Why Not Apollo Client:**
Apollo Client is feature-rich but heavy (adds ~100KB+ to bundle), and its complex caching layer is often unnecessary for authenticated applications where data is user-specific and doesn't benefit from normalized caching. The response parsing overhead also makes it much slower for large responses.

### @shane32/msoauth over MSAL.js

[`@shane32/msoauth`](https://www.npmjs.com/package/@shane32/msoauth) is used for Microsoft OAuth authentication instead of Microsoft's official MSAL.js library.

**Rationale:**

- **Tiny footprint:** Minimal bundle size focused only on OAuth flow
- **Reliable:** Simple, focused implementation without the bugs and complexity of MSAL.js
- **Simpler API:** Straightforward authentication flow without MSAL's complexity
- **Backend-driven authentication:** Delegates token validation and user management to the backend
- **Sufficient for most scenarios:** Provides OAuth redirect flow without unnecessary features

**What It Provides:**

- OAuth 2.0 authorization code flow with PKCE
- Automatic redirect handling
- Token acquisition and storage
- Silent token refresh via backend

**What It Doesn't Provide (and why that's okay):**

- Client-side token validation: Backend validates tokens, which is more secure
- Multiple account support: Most applications use single account
- Advanced MSAL features: Rarely needed for typical SPA scenarios

**Why Not MSAL.js:**
MSAL.js is the official library but is notoriously fat and buggy, with a complex API and much larger bundle size. Its complexity often leads to authentication issues that are difficult to debug.

## Backend Stack

### ASP.NET Core

ASP.NET Core 10.0+ is used as the web framework.

**Rationale:**

- High-performance, cross-platform framework
- Excellent dependency injection support
- Strong typing with C# language features
- Comprehensive middleware pipeline
- Native support for modern web standards

### Entity Framework Core

Entity Framework Core 10.0+ is used as the ORM.

**Rationale:**

- **Ease of use:** LINQ queries are intuitive and type-safe
- **Productivity:** Automatic change tracking and migrations
- **Code-first approach:** Database schema defined in C# code
- **Strong typing:** Compile-time safety for database operations
- **Excellent tooling:** Migration generation, database updates, scaffolding
- **LINQ-to-SQL translation:** Efficient query generation from LINQ expressions

**Trade-offs:**

- Slightly less performant than raw SQL for complex queries (can use raw SQL when needed)
- Learning curve for advanced features
- Potential for N+1 queries if not careful (mitigated by GraphQL.Linq integration)

### AutoMapper

AutoMapper 14.0+ with EF Core integration is used for object mapping.

**Rationale:**

- **Reduces boilerplate:** Eliminates repetitive mapping code
- **Convention-based:** Automatically maps properties with matching names
- **EF Core integration:** Properly handles navigation properties and collections
- **Maintainability:** Centralized mapping configuration
- **Type safety:** Compile-time checking of mapping configurations

**Usage in Template:**

- Maps GraphQL input models to EF Core entities
- Handles both creation (`Map<TDestination>`) and updates (`Map(source, destination)`)
- Configured in [`AutoMapperProfile.cs`](../AppGraphQL/AutoMapper/AutoMapperProfile.cs)

### GraphQL.NET Ecosystem

GraphQL.NET 8.x with Shane32 extensions is used for the GraphQL API.

**Rationale:**

- **Mature .NET implementation:** Industry-standard GraphQL server for .NET
- **Flexible schema definition:** Code-first approach with strong typing
- **Excellent performance:** Efficient query execution and data loading
- **Comprehensive features:** Subscriptions, data loaders, authorization, validation

### Shane32 NuGet Packages

The template uses several specialized packages from the Shane32 ecosystem:

#### Shane32.GraphQL.DI

[`Shane32.GraphQL.DI`](https://www.nuget.org/packages/Shane32.GraphQL.DI/) provides dependency injection integration for GraphQL.NET.

**Rationale:**

- Simplifies GraphQL schema registration
- Automatic discovery and registration of graph types
- Scoped service resolution for field resolvers
- Reduces boilerplate DI configuration

#### GraphQL.Linq.EntityFrameworkCore8

[`GraphQL.Linq.EntityFrameworkCore8`](https://www.nuget.org/packages/GraphQL.Linq.EntityFrameworkCore8/) enables direct translation of GraphQL queries to SQL via LINQ.

**Rationale:**

- **Eliminates N+1 queries:** Automatically generates efficient SQL joins
- **Database optimization:** Leverages database indexes for GraphQL queries
- **Type safety:** Compile-time checking of field resolvers
- **Performance:** GraphQL field selection translates to SQL column selection
- **Simplicity:** No need for data loaders or manual query optimization

**Key Feature:** Configured via [`AddLinq<AppDbContext>()`](../AppGraphQL/Startup.cs#L31), enabling GraphQL queries to become efficient SQL queries automatically.

#### GraphQL.AspNetCore3.JwtBearer

[`GraphQL.AspNetCore3.JwtBearer`](https://www.nuget.org/packages/GraphQL.AspNetCore3.JwtBearer/) provides JWT authentication integration for GraphQL endpoints. This package includes a dependency on [`GraphQL.AspNetCore3`](https://www.nuget.org/packages/GraphQL.AspNetCore3/), which provides the ASP.NET Core middleware for GraphQL.

**Rationale:**

- Seamless JWT token validation
- Integration with ASP.NET Core authentication
- Authorization policy support for GraphQL fields
- Secure by default configuration
- Includes ASP.NET Core middleware for hosting GraphQL endpoints

#### Shane32.Analyzers

[`Shane32.Analyzers`](https://www.nuget.org/packages/Shane32.Analyzers/) provides Roslyn analyzers for code quality.

**Rationale:**

- Enforces coding standards at compile time
- Catches common mistakes and anti-patterns
- Improves code consistency across the solution
- Zero runtime overhead (analyzer-only package)

## Database

### SQL Server for Production, SQLite for Testing

SQL Server is used for development/production, while in-memory SQLite is used for tests.

**Rationale:**

- **SQL Server:** Enterprise-grade database with excellent Azure integration
- **SQLite for tests:** Fast, isolated test execution without infrastructure dependencies
- **Compatibility:** EF Core abstracts most differences between providers

**Trade-offs:**

- Some SQL Server-specific features won't work in tests
- Need to ensure schema compatibility between providers

**Alternative:** Use SQL Server LocalDB for tests (slower but more accurate). See [`LocalDb`](https://www.nuget.org/packages/LocalDb) NuGet package for easy integration.

## Development Tools

### GraphiQL IDE

GraphiQL is integrated into the SPA as a lazy-loaded development tool, accessible at `/graphiql` when authenticated.

**Rationale:**

- **Integrated development experience:** Test GraphQL queries directly within the application
- **Lazy loaded:** Only downloaded when accessed, keeping the main bundle small
- **Authenticated access:** Uses the same authentication context as the rest of the application
- **Production-ready:** Can be safely included in production builds since it's lazy loaded

**Implementation:**

- Lazy loaded via React's `lazy()` in [`App.tsx`](../ReactApp/src/App.tsx)
- Custom implementation in [`GraphiQL.tsx`](../ReactApp/src/pages/graphiql/GraphiQL.tsx)
- Template includes a link from the navigation bar when logged in

### Husky for Pre-Commit Hooks

Husky 9.1+ is used for Git hooks in the frontend.

**Rationale:**

- Enforces code quality before commits
- Automatic formatting with Prettier
- Linting with ESLint
- TypeScript compilation checks
- Prevents broken code from entering the repository

### GitHub Actions for CI/CD

GitHub Actions with SharedWorkflows is used for continuous integration and deployment.

**Rationale:**

- Native GitHub integration
- Reusable workflows across projects
- Flexible deployment options (App Service, Blob Storage, etc.)
- Automated testing and quality checks

## Summary

This template prioritizes:

1. **Developer productivity:** TypeScript, code generation, and modern tooling
2. **Type safety:** End-to-end type safety from database to UI
3. **Simplicity:** Straightforward patterns without unnecessary complexity
4. **Performance:** Efficient GraphQL-to-SQL translation and optimized builds
5. **Maintainability:** Clear separation of concerns and consistent patterns

The stack is optimized for building authenticated, data-driven single-page applications with a focus on developer experience and long-term maintainability.
