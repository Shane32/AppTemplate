# Operational Principles

This document outlines the key operational principles and design decisions that govern how this application template functions. Understanding these principles is essential before working with or extending the template.

## Application Startup & Infrastructure

### 1. Automatic Database Migration on Startup

The application automatically runs pending EF Core migrations during startup via [`RunInitializationTestsAsync()`](../AppServer/Startup.cs#L172), ensuring the database schema is always current without manual intervention. This means:

- No need to manually run migration commands in production
- Database schema updates deploy automatically with application updates
- Failed migrations will prevent application startup, ensuring schema consistency

**Alternative:** To disable automatic migrations, remove the migration code from [`RunInitializationTestsAsync()`](../AppServer/Startup.cs#L184) and run migrations manually via deployment scripts or CI/CD pipelines.

### 2. Dependency Injection Validation Always Enabled

[`ValidateScopes`](../AppServer/Program.cs#L27) and [`ValidateOnBuild`](../AppServer/Program.cs#L29) are set to `true` in all environments (not just development), catching DI configuration errors at startup rather than runtime. This ensures:

- Scoped services are never accidentally resolved from the root container
- All dependencies can be resolved before the application starts serving requests
- Configuration errors are caught immediately during deployment

**Alternative:** For faster startup times in production, set `ValidateScopes` and `ValidateOnBuild` to `false` in non-development environments, though this trades startup validation for runtime errors.

### 3. Configuration Layering with Azure Key Vault

Configuration loads in sequence: appsettings.json → user secrets → environment variables → appsettings.Local.json → Azure Key Vault (if [`KeyVaultName`](../AppServer/Program.cs#L20) is specified), with later sources overriding earlier ones. The `KeyVaultName` itself can be specified in [`appsettings.json`](../AppServer/appsettings.json), user secrets, or environment variables. This enables:

- Local development overrides without modifying committed files
- Secure production secrets management via Key Vault
- Environment-specific configuration through environment variables
- Single deployment artifact that can be published to multiple servers, each using a different Key Vault specified via environment variables

**Alternative:** To use a different secrets management solution (AWS Secrets Manager, HashiCorp Vault, etc.), replace the Azure Key Vault configuration in [`Program.cs`](../AppServer/Program.cs#L36) with the appropriate provider.

### 4. Environment-Specific Credential Providers

Azure Key Vault uses [`VisualStudioCredential`](../AppServer/Program.cs#L39) in debug mode for local development and [`DefaultAzureCredential`](../AppServer/Program.cs#L41) in production for managed identity authentication. This provides:

- Seamless local development with Visual Studio credentials
- Secure production deployment with managed identities
- No passwords or connection strings in configuration files

## GraphQL Configuration

### 1. Persisted Query System

GraphQL uses a persisted documents approach where queries are pre-registered and referenced by hash. In debug mode, it reads from an [embedded resource](../AppGraphQL/Startup.cs#L59); in production, from a [file](../AppGraphQL/Startup.cs#L72). This provides:

- Protection against arbitrary GraphQL queries in production
- Reduced payload sizes (only hashes are sent)
- Better production debugging with operation names included in hashes

**Important:** Because persisted queries are loaded from a file that's deployed with the application, **previously deployed frontend applications may stop functioning after a new backend deployment** if the queries they use are removed from the persisted documents file. This can happen during rolling deployments or when multiple versions of the frontend are in use.

**Alternatives:**

- To allow arbitrary queries in production (e.g., for GraphiQL access), set `AllowOnlyPersistedDocuments` to `false` in [`Startup.cs`](../AppGraphQL/Startup.cs#L44), though this reduces security.
- To support multiple application versions simultaneously, implement a shared persisted query store (e.g., Redis cache, database table, or blob storage) that accumulates queries from all deployments rather than replacing them. Modify the `GetQueryDelegate` in [`Startup.cs`](../AppGraphQL/Startup.cs#L47) to read from this shared store.

### 2. Serial Query Execution Strategy

GraphQL queries use [`SerialExecutionStrategy`](../AppGraphQL/Startup.cs#L25) rather than parallel execution, ensuring predictable database query ordering and avoiding potential race conditions. This provides:

- Consistent query execution order
- Easier debugging and profiling
- Avoidance of database deadlocks from parallel queries

### 3. Scoped Subscription Execution

GraphQL subscriptions use [`AddScopedSubscriptionExecutionStrategy()`](../AppGraphQL/Startup.cs#L26), creating a new DI scope per subscription event to properly handle scoped services like DbContext. This ensures:

- Each subscription event gets a fresh DbContext
- No entity tracking conflicts between events
- Proper disposal of scoped resources

### 4. WebSocket Protocol Restriction

WebSocket subscriptions only support the [newer graphql-transport-ws protocol](../AppServer/Startup.cs#L143) with secure keep-alive mechanics, not the legacy subscriptions-transport-ws. This ensures:

- Reliable connection management with timeouts
- Better error handling and reconnection logic
- Modern client library compatibility

### 5. Response Compression for GraphQL

HTTPS response compression is [explicitly enabled](../AppServer/Startup.cs#L91) for `application/graphql-response+json` MIME type to reduce payload sizes. This provides:

- Faster response times for large GraphQL queries
- Reduced bandwidth usage
- Better performance on slower connections

### 6. GraphQL-to-SQL Direct Translation

The [`AddLinq<AppDbContext>()`](../AppGraphQL/Startup.cs#L31) configuration enables direct translation of GraphQL queries to SQL, allowing database indexes to optimize query performance. This means:

- GraphQL queries become efficient SQL queries
- Database indexes directly improve GraphQL performance
- No N+1 query problems with proper field selection

## Authentication & Authorization

### 1. User Auto-Provisioning on Authentication

When a user authenticates via JWT, [`DbAuthService`](../AppServer/DbAuthService.cs#L34) automatically creates a database user record if one doesn't exist, syncing name/email on each login. This means:

- No separate user registration flow needed
- User information stays synchronized with identity provider
- First-time users are automatically onboarded

**Alternative:** To require explicit user registration, modify [`DbAuthService.OnTokenValidatedAsync()`](../AppServer/DbAuthService.cs#L34) to reject authentication if the user doesn't exist in the database, and create a separate registration endpoint.

### 2. Claims Sanitization for Security

All `DbUserId` and role claims are [cleared from incoming tokens](../AppServer/DbAuthService.cs#L104) before being repopulated from the database, preventing claim injection attacks. This ensures:

- Roles are always sourced from the database, not the JWT token
- Users cannot forge elevated permissions
- Database is the single source of truth for authorization

### 3. Authorization Required by Default

The GraphQL endpoint requires [`AuthorizationRequired = true`](../AppServer/Startup.cs#L125) with a minimum viewer policy, meaning all requests must be authenticated unless explicitly overridden. This provides:

- Secure by default configuration
- No accidental exposure of unauthenticated endpoints
- Explicit opt-in for public queries if needed

**Alternative:** To allow unauthenticated access to specific queries, set `AuthorizationRequired = false` and use `[Authorize]` attributes on individual fields or types that require authentication.

## Deployment & Frontend Integration

### 1. Single Deployment Artifact (Backend Serves SPA)

The template is configured to deploy both the backend and frontend as a single artifact to Azure App Service. In debug builds, the backend [proxies requests to Vite](../AppServer/Startup.cs#L166) running on port 5173 for hot module replacement. In production, the backend serves the built SPA files from the `wwwroot` directory. This provides:

- Simplified deployment with a single Azure App Service
- Single URL for the entire application
- No CORS configuration needed in production
- Easier local development with automatic proxy setup

**Important deployment consideration:** Because the SPA files are replaced during deployment, **clients with the application already loaded may experience broken functionality** when lazy-loaded pages or chunks are requested after deployment, as the old files no longer exist on the server. This affects users who have the application open during a deployment.

**Alternative:** To avoid this issue, deploy the backend and frontend separately:

- Deploy the backend API to Azure App Service or Azure Container Apps
- Deploy the SPA to Azure Blob Storage with Azure CDN, using versioned paths (e.g., `/v1.2.3/`) that don't replace old files
- Configure CORS on the backend to allow requests from the CDN origin
- This allows old application versions to continue functioning until users refresh their browser, providing zero-downtime deployments (assuming persisted queries are also handled via a shared store)
- **Note:** The included GitHub Actions workflows already support this deployment pattern - they can push the SPA to blob storage instead of wwwroot by configuring the appropriate options. See [SharedWorkflows](https://github.com/Shane32/SharedWorkflows) for more details on configuration options.

### 2. Type-Safe GraphQL Code Generation

The frontend uses the backend's [introspection schema](../ReactApp/codegen.ts#L4) from approval tests to generate TypeScript types, ensuring compile-time type safety across the stack. This provides:

- TypeScript autocomplete for all GraphQL queries
- Compile-time errors when backend schema changes
- End-to-end type safety from database to UI

## Database & Data Access

### 1. SQLite for Testing, SQL Server for Production

Tests use an [in-memory SQLite database](../Tests/_TestSetup/TestBase.cs#L49) while development/production use SQL Server, requiring schema compatibility considerations. This means:

- Fast, isolated test execution
- No need for test database infrastructure
- Some SQL Server-specific features may not work in tests

**Alternative:** To test against SQL Server, configure tests to use a real SQL Server database (LocalDB or containerized) instead of SQLite, though this will slow down test execution. See the [LocalDb](https://www.nuget.org/packages/LocalDb) NuGet package which provides a simple way to utilize SQL Server Express LocalDB in place of SQLite within the provided testing framework.

### 2. Change Tracker Clearing in Tests

Test queries [clear the EF change tracker](../Tests/_TestSetup/TestBase.cs#L75) before and after execution by default to ensure tests don't inadvertently rely on cached entities. This ensures:

- Each test query sees fresh data from the database
- No hidden dependencies between test operations
- Predictable test behavior

### 3. AutoMapper with EF Core Integration

AutoMapper is configured to [use EF Core model metadata](../AppServer/Startup.cs#L86) and collection mappers, enabling direct mapping between entities and DTOs with proper relationship handling. This provides:

- Automatic mapping configuration based on EF model
- Proper handling of navigation properties
- Collection synchronization support

## Code Quality & Development Standards

### 1. Warnings Treated as Errors

[`TreatWarningsAsErrors`](../Directory.Build.props#L6) is enabled globally, enforcing code quality by preventing compilation with any warnings. This ensures:

- High code quality standards
- No ignored warnings that could indicate bugs
- Consistent code across the entire solution

### 2. Pre-Commit Quality Checks

The SPA uses a [`.husky/pre-commit`](../ReactApp/.husky/pre-commit) hook that automatically runs quality checks before each commit, preventing code quality issues from entering the repository. The hook performs three checks:

1. **[`pretty-quick`](../ReactApp/.husky/pre-commit#L2)** - Automatically reformats staged SPA files using Prettier, ensuring consistent code formatting
2. **[`lint`](../ReactApp/.husky/pre-commit#L3)** - Runs ESLint to catch code quality issues, potential bugs, and style violations
3. **[`tsc`](../ReactApp/.husky/pre-commit#L4)** - Compiles TypeScript to verify type safety and catch compilation errors

This means:

- Formatting issues in SPA files are automatically fixed before commit
- Linting errors must be resolved before code can be committed
- TypeScript compilation errors prevent commits, ensuring type safety
- All committed code meets quality standards without manual intervention

**Note:** C# code formatting is enforced during CI/CD builds via the [SharedWorkflows](https://github.com/Shane32/SharedWorkflows) [`build-check.yml`](../.github/workflows/build_check.yml#L12) workflow, which runs `dotnet format --verify-no-changes` to ensure consistent formatting across the backend codebase.

**Alternative:** To bypass pre-commit hooks temporarily (not recommended), use `git commit --no-verify`. To disable permanently, remove the `.husky` directory, though this will reduce code quality enforcement.

### 3. Global Implicit Usings

Common namespaces like [`AppDb`](../Directory.Build.props#L14), [`Microsoft.EntityFrameworkCore`](../Directory.Build.props#L16), and [`Microsoft.Extensions.DependencyInjection`](../Directory.Build.props#L17) are globally imported, reducing boilerplate. This means:

- Less repetitive using statements
- Cleaner code files
- Consistent namespace availability across projects

## GraphQL Design Principles

While the GraphQL.NET framework is flexible enough to support any GraphQL schema design, this template follows specific design principles that optimize for single-page application (SPA) development and maintainability:

### 1. Pagination at Query Root Only

Paginated responses are always returned directly from [`Query`](../AppGraphQL/Query.cs) root fields, never from nested object fields. For example:

- ✅ **Correct:** `query { reviews(productId: "1", first: 10) { edges { node { title } } } }`
- ❌ **Avoid:** `query { product(id: "1") { reviews(first: 10) { edges { node { text } } } } }`

**Rationale:** This design keeps queries simple and predictable, avoiding deeply nested pagination logic.

### 2. SPA-Centric Object Design

GraphQL types are designed to be logical from the perspective of the single-page application, typically (but not always) mapping directly to database tables. This means:

- Types represent concepts meaningful to the frontend, not just database schema
- Related data is structured for efficient client-side consumption
- Object relationships reflect how the SPA navigates and displays data

**Example:** A [`PostGraphType`](../AppGraphQL/QueryGraphs/PostGraphType.cs) might include computed fields like `isLikedByCurrentUser` or `commentCount` that don't exist as database columns but are essential for the UI.

**Rationale:** This approach minimizes the impedance mismatch between backend and frontend, reducing the need for complex client-side data transformations.

### 3. Namespaced Mutations

Mutations are organized into namespaces based on the entity or domain they operate on. For example, all mutations related to the `Product` entity are grouped under a `product` namespace:

```graphql
mutation {
  product {
    edit(id: 1, input: { name: "Updated Name" }) {
      id
      name
    }
  }
}
```

**Implementation:** See [`Mutation.cs`](../AppGraphQL/Mutation.cs) for the root mutation type, and [`PostMutation.cs`](../AppGraphQL/MutationGraphs/PostMutation.cs) and [`CommentMutation.cs`](../AppGraphQL/MutationGraphs/CommentMutation.cs) for examples of namespaced mutation implementations.

**Rationale:** This organization:

- Prevents naming conflicts (e.g., multiple `edit` mutations for different entities)
- Makes the schema more discoverable and self-documenting
- Groups related operations logically
- Scales better as the schema grows

### 4. Extensive Use of Non-Null Types

Non-null types (`!` in GraphQL) are used extensively throughout the schema. When a query or mutation produces an error, it bubbles up through the response rather than returning null values:

```graphql
type Query {
  post(id: ID!): Post! # Returns Post or error, never null
}

type Post {
  id: ID!
  title: String! # Always present, never null
  author: User! # Always present, never null
}
```

**Rationale:** This design:

- Makes the schema more predictable and type-safe
- Forces explicit error handling rather than null checks
- Aligns with the principle that missing data is an error condition, not a valid state
- Simplifies client-side TypeScript code by eliminating unnecessary null checks

**Error Handling:** When an error occurs (e.g., post not found, authorization failure), GraphQL returns an error in the `errors` array and the field resolves to `null`, which bubbles up to the nearest nullable parent. This is why root query fields should be non-null - errors will appear in the response's `errors` array with proper error messages.

**Implementation:** See [`PostGraphType.cs`](../AppGraphQL/QueryGraphs/PostGraphType.cs) and other graph types for examples of non-null field definitions.
