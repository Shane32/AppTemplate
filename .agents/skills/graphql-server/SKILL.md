---
name: graphql-server
description: Add or edit server-side GraphQL schemas, queries, mutations, graph types, and resolvers. Use when modifying C# GraphQL.NET server code, adding new entity types, creating query endpoints, implementing mutations, updating the GraphQL schema, working with EfObjectGraphType, DIObjectGraphBase, AutoMapper integration, GraphQL.Linq patterns, or writing GraphQL tests.
---

# GraphQL Server-side graph design rules

## When to Use This Skill

Use this skill when the user requests:

- Adding new GraphQL queries or mutations
- Creating or modifying entity graph types (PostGraphType, UserGraphType, etc.)
- Implementing server-side GraphQL resolvers
- Adding navigation properties or relationships to graph types
- Modifying the GraphQL schema structure
- Creating input models or output models (DTOs)
- Working with Entity Framework and GraphQL integration
- Implementing pagination with Relay connections
- Adding AutoMapper mappings for GraphQL inputs
- Writing or updating GraphQL tests
- Fixing GraphQL schema errors or validation issues
- Adding fields to existing graph types
- Implementing data loaders or batch loading
- Working with C# code in the `AppGraphQL/` folder

## Quick Reference

- **Query entry points**: `AppGraphQL/Query.cs`
- **Entity graphs**: `AppGraphQL/QueryGraphs/*.cs` (derive from `EfObjectGraphType`)
- **Mutations**: `AppGraphQL/MutationGraphs/*.cs` (derive from `DIObjectGraphBase`)
- **Input models**: `AppGraphQL/InputModels/*.cs`
- **Output models**: `AppGraphQL/OutputModels/*.cs`
- **Tests**: `Tests/Queries/*.cs` and `Tests/Mutations/*.cs`
- **Schema file**: `Tests/Infrastructure/ServerTests.Introspection.approved.graphql`
- **Update schema**: Run `dotnet test` and approve introspection changes
- **Key libraries**: GraphQL.NET, GraphQL.Linq, GraphQL.DI, Entity Framework Core, AutoMapper

When the user requests new or modified graphs, the following rules should be followed:

## Design Principles

### Query Entry Points

All entry points to the GraphQL graph should be defined in `Query.cs`. This includes:

- **Lookups by ID**: Single entity retrieval methods (e.g., `UserAsync`, `PostAsync`)
- **Search/List operations**: Connection-based pagination for browsing collections (e.g., `UsersAsync`, `PostsAsync`)
- **Special queries**: Context-specific queries like `MeAsync` for the current user

### List Handling Strategy

Choose the appropriate list representation based on expected data volume:

1. **Root Query Lists** → Use **Relay Connections**
   - For browsing/searching from the root query
   - Provides pagination, cursors, and page info
   - Example: `PostsAsync` returns `Connection<EfSource<Post>>`

2. **Navigation Properties (Limited Results)** → Use **List Types**
   - When the quantity of results is expected to be limited
   - Served by data loaders for efficient batching
   - Example: Categories that a product belongs to, comments on a post (if limited)

3. **Navigation Properties (Large Results)** → **Omit from Graph**
   - When the quantity of results is expected to be large
   - Example: All reviews of a popular product, all posts by a prolific user
   - Instead, provide a root query with filtering/pagination

## GraphQL.Linq Integration

This project uses **GraphQL.Linq** for direct GraphQL-to-SQL conversion. For detailed design instructions for database graphs, read the comprehensive documentation:

```powershell
Invoke-RestMethod https://raw.githubusercontent.com/graphql-linq/GraphQL.Linq/refs/heads/master/README.md
```

Key concepts from GraphQL.Linq:

- Direct translation of GraphQL queries to SQL
- Efficient data loading with automatic batching
- Type-safe field definitions with lambda expressions

## Folder Structure

```
AppGraphQL/
├── QueryGraphs/          # Entity graph types (derive from EfObjectGraphType)
│   ├── PostGraphType.cs
│   ├── UserGraphType.cs
│   └── CommentGraphType.cs
├── OutputModels/         # Simple output models (for DTOs)
│   └── PostSummary.cs
├── InputModels/          # Input models for mutations
│   ├── AddPostInput.cs
│   └── UpdatePostInput.cs
├── MutationGraphs/       # Mutation groups by subject/entity
│   ├── PostMutation.cs
│   └── CommentMutation.cs
├── Query.cs              # Root query type
└── Mutation.cs           # Root mutation type
```

## Query Graph Types (Entity Graphs)

Entity graph types derive from `EfObjectGraphType<AppDbContext, TEntity>` and define how database entities are exposed in the GraphQL schema.

### Field Definitions

- **ID Fields**: Use `EfIdField()` for identifier fields
- **Regular Fields**: Use `EfField()` for all other fields
- **Nullability**: Automatically inferred from property types

### Basic Example

```csharp
public class PostGraphType : EfObjectGraphType<AppDbContext, Post>
{
    public PostGraphType()
    {
        // ID fields
        EfIdField(x => x.Id);
        EfIdField(x => x.UserId);

        // Regular fields - nullability inferred from property type
        EfField(x => x.Title);
        EfField(x => x.Content);
        EfField(x => x.CreatedAt);
    }
}
```

### Navigation Properties

Use `DelayLoadEntry` for single navigation properties (many-to-one):

```csharp
// Single navigation property (Post.User)
EfField("User", x => x.UserId)
    .DelayLoadEntry(ctx => ctx.DbContext.Users, x => x.Id);
```

### List Properties

Use `DelayLoadList` for collection navigation properties (one-to-many):

```csharp
// List navigation property (Post.Comments)
EfField("Comments", x => x.Id)
    .DelayLoadList(ctx => ctx.DbContext.Comments.OrderBy(x => x.Id), x => x.PostId);
```

### Post-Processing with ThenResolve

Use `ThenResolve` to transform field values after they're retrieved from the database:

```csharp
// Convert flags enum to list of individual enum values
EfField(x => x.Roles)
    .ThenResolve(role => Enum.GetValues<Role>().Where(r => r != 0 && role.HasFlag(r)));

// Format or compute values
EfField(x => x.Price)
    .ThenResolve(price => Math.Round(price, 2));

// Transform strings
EfField(x => x.Email)
    .ThenResolve(email => email?.ToLowerInvariant());
```

## Root Query Examples

### Lookup by ID

```csharp
public Task<EfSource<Post>> PostAsync([Id] int id, CancellationToken cancellationToken)
    => _db.Posts.ToGraphSingleAsync(x => x.Id == id);
```

### Connection (Paginated List)

```csharp
public Task<Connection<EfSource<Post>>> PostsAsync(
    int? first,
    int? last,
    [Id] string? before,
    [Id] string? after,
    CancellationToken cancellationToken)
{
    var query = _db.Posts.OrderBy(x => x.Id);
    return query.ToGraphConnectionAsync(first, last, after, before, maxPageSize: 100);
}
```

## Output Model Graph Types (DTOs)

For simple output models (DTOs) that don't map directly to database entities, create graph types in the `OutputModels` folder.

### Requirements

- Output models must be decorated with `[MapAutoClrType]`
- Graph types can use standard GraphQL.NET field definitions
- Useful for computed values, aggregations, or cross-entity projections

### Example

```csharp
// Output model
[MapAutoClrType]
public class PostSummary
{
    [Id]
    public int Id { get; set; }
    public string Title { get; set; }
    public int CommentCount { get; set; }
}
```

## Mutations

### Organization

Mutations are grouped by subject or entity in the `MutationGraphs` folder. Each mutation group derives from `DIObjectGraphBase`.

### Naming Conventions

- Use generic action names: `Add`, `Update`, `Delete` (not `AddPost`, `UpdatePost`)
- Async methods should be named with `Async` suffix: `AddAsync`, `UpdateAsync`, `DeleteAsync`
- The grouping provides context (e.g., `Posts.Add`, `Posts.Update`)

### Dependency Injection

Mutation classes use constructor injection. Common dependencies:

- `AppDbContext` - Database context
- `IMapper` - AutoMapper for input model mapping
- Any other required services

### Basic Example

```csharp
public class PostMutation : DIObjectGraphBase
{
    private readonly AppDbContext _db;
    private readonly IMapper _mapper;

    public PostMutation(AppDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<EfSource<Post>> AddAsync(AddPostInput input, CancellationToken cancellationToken)
    {
        var post = _mapper.Map<Post>(input);
        _db.Posts.Add(post);
        await _db.SaveChangesAsync(cancellationToken);
        return await _db.Posts.ToGraphSingleAsync(x => x.Id == post.Id);
    }

    public async Task<EfSource<Post>> UpdateAsync([Id] int id, UpdatePostInput input, CancellationToken cancellationToken)
    {
        var post = await _db.Posts.FindAsync([id], cancellationToken)
            ?? throw new ExecutionError("Post not found");
        _mapper.Map(input, post);
        await _db.SaveChangesAsync(cancellationToken);
        return await _db.Posts.ToGraphSingleAsync(x => x.Id == post.Id);
    }

    public async Task<bool> DeleteAsync([Id] int id, CancellationToken cancellationToken)
    {
        var post = await _db.Posts.FindAsync([id], cancellationToken)
            ?? throw new ExecutionError("Post not found");
        _db.Posts.Remove(post);
        await _db.SaveChangesAsync(cancellationToken);
        return true;
    }
}
```

### Registering Mutation Groups

In `Mutation.cs`, use `[DIGraph]` to register mutation groups:

```csharp
public sealed class Mutation : DIObjectGraphBase
{
    [DIGraph(typeof(PostMutation))]
    public static string Posts() => string.Empty;

    [DIGraph(typeof(CommentMutation))]
    public static string Comments() => string.Empty;
}
```

## Input Models

Input models define the shape of data accepted by mutations. They are placed in the `InputModels` folder.

### Attributes

- **`[Id]`**: Mark parameters that represent GraphQL IDs (will be validated/converted)

### Example

```csharp
/// <summary>
/// Input model for adding a new post.
/// </summary>
public class AddPostInput
{
    public required string Title { get; set; }
    public required string Content { get; set; }
    public required int UserId { get; set; }
}
```

## AutoMapper Integration

AutoMapper is used to map input models to Entity Framework entities. Configure mappings in `AppGraphQL/AutoMapper/AutoMapperProfile.cs`.

### Example Mappings

```csharp
public class AutoMapperProfile : Profile
{
    public AutoMapperProfile(TimeProvider timeProvider)
    {
        // Add mapping - includes computed fields
        CreateMap<AddPostInput, Post>()
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(_ => timeProvider.GetUtcNow()));

        // Update mapping - only maps provided fields
        CreateMap<UpdatePostInput, Post>();
    }
}
```

## DIObjectGraphBase and [DIGraph]

The `DIObjectGraphBase` class and `[DIGraph]` attribute enable dependency injection in GraphQL types. For detailed instructions, read the documentation:

```powershell
Invoke-RestMethod https://raw.githubusercontent.com/Shane32/GraphQL.DI/refs/heads/master/README.md
```

### Key Concepts

- **`DIObjectGraphBase`**: Base class that enables DI in graph types
- **`[DIGraph]`**: Attribute to register nested graph types with DI support
- Constructor injection works automatically for registered services
- Methods become GraphQL fields automatically

## Schema Updates and Client Codegen

When graphs are altered, the schema file must be updated for client-side code generation to function correctly.

### Update Process

1. **Run Tests**: Execute the test suite

   ```bash
   dotnet test
   ```

2. **Introspection Test Fails**: The introspection test will fail and generate an approval file

3. **Approve Changes**: Follow the instructions in the test output to approve the changes
   - This typically involves copying the `.received.graphql` file to `.approved.graphql`

### Why This Matters

- Client-side TypeScript types are generated from the schema file
- Outdated schema = incorrect TypeScript types = runtime errors
- The approval test ensures schema changes are intentional and reviewed

## Testing GraphQL Queries and Mutations

All GraphQL queries and mutations should be tested using approval testing. Tests are located in the `Tests` project.

### Using Seed Data

Tests should preferably use preexisting seed data from the `TestDb` project. If the existing seed data is insufficient for your test, extend it by creating new seed classes or modifying existing ones.

#### Seed Data Location

Seed classes are located in `TestDb/Seeds/` and follow this pattern:

```
TestDb/Seeds/
├── UserSeed.cs
├── PostSeed.cs
└── CommentSeed.cs
```

#### Creating a Seed Class

Each seed class inherits from `Seed<T>` and must seed any dependencies before adding its own data:

```csharp
namespace TestDb.Seeds;

internal class PostSeed : Seed<Post>
{
    public override async Task SeedAsync(TestDbContext db, CancellationToken cancellationToken = default)
    {
        // IMPORTANT: Seed dependencies first
        await db.SeedAsync<User>(cancellationToken);

        // Use fixed dates for consistent test results
        var createdAt = DateTimeOffset.Parse("2024-10-25T00:00:00Z", CultureInfo.InvariantCulture);

        db.Add(new Post {
            Id = 1,
            Title = "Hello",
            Content = "Hello, World!",
            UserId = 1,
            CreatedAt = createdAt,
        });
    }
}
```

**Key Points:**

- Always seed dependencies first (e.g., `User` before `Post`)
- Use fixed dates/times for deterministic test results
- Use explicit IDs for predictable test data
- The seed framework prevents duplicate seeding automatically

### Writing GraphQL Tests

GraphQL tests should inherit from `TestBase` and follow this pattern:

```csharp
namespace Queries;

public class Posts : TestBase
{
    [Fact]
    public async Task Get()
    {
        // Seed all required data (this will cascade to dependencies)
        await Db.SeedAsync<Comment>();

        // Run the GraphQL query
        var response = await RunQueryAsync("""
            query {
              posts {
                items {
                  id
                  title
                  content
                  user {
                    id
                    name
                  }
                  comments {
                    id
                    content
                  }
                }
                totalCount
              }
            }
            """);

        // Use approval testing to verify the response
        response.ShouldMatchApproved();
    }
}
```

### Test Approval Workflow

**CRITICAL**: Always read the output file before approving to ensure the test produced valid results.

1. **Run the test** (it will fail on first run):

   ```bash
   dotnet test
   ```

2. **Read the `.received.txt` file** in the test directory:
   - Verify the response structure is correct
   - Check for errors in the response
   - Ensure data values are as expected
   - Confirm no unexpected fields or null values

3. **Example of a GOOD response** to approve:

   ```json
   {
     "data": {
       "posts": {
         "items": [
           {
             "id": "1",
             "title": "Hello",
             "content": "Hello, World!"
           }
         ]
       }
     }
   }
   ```

4. **Example of a BAD response** (DO NOT APPROVE):

   ```json
   {
     "errors": [
       {
         "message": "Cannot return null for non-null field",
         "path": ["posts", "items", 0, "user"]
       }
     ],
     "data": null
   }
   ```

5. **Only after verifying the output is correct**, copy the received file to approved:

   ```bash
   # Windows
   copy Tests\Queries\Posts.Get.received.txt Tests\Queries\Posts.Get.approved.txt
   ```

6. **Rerun tests** to confirm they pass:
   ```bash
   dotnet test
   ```

### Best Practices

- **Seed at the highest level needed**: If testing comments, seed `Comment` (which cascades to `Post` and `User`)
- **Use fixed test data**: Dates, IDs, and other values should be deterministic
- **Test navigation properties**: Include related entities in queries to verify relationships
- **Read before approving**: Always inspect the `.received.txt` file for errors or invalid data
- **Test error cases**: Create tests for invalid inputs and verify error messages
- **Keep tests focused**: Each test should verify one specific behavior
