#pragma warning disable IDE0060 // Remove unused parameter
using AppGraphQL.Extensions;

namespace AppGraphQL;

public sealed class QueryType : DIObjectGraphType<Query> { }

[Authorize(Policy = SecurityPolicies.QUERY_POLICY)]
public sealed class Query : DIObjectGraphBase
{
    private readonly AppDbContext _db;

    public Query(AppDbContext db)
    {
        _db = db;
    }

    public Task<EfSource<User>> UserAsync([Id] int id, CancellationToken cancellationToken) => _db.Users.ToGraphSingleAsync(x => x.Id == id);

    public Task<Connection<EfSource<User>>> UsersAsync(int? first, int? last, [Id] string? before, [Id] string? after, CancellationToken cancellationToken)
    {
        var query = _db.Users.OrderBy(x => x.Id);

        return query.ToGraphConnectionAsync(first, last, after, before, 100);
    }

    public Task<EfSource<User>> MeAsync(CancellationToken cancellationToken) => _db.Users.ToGraphSingleAsync(x => x.Id == this.GetUserId());

    public Task<EfSource<Post>> PostAsync([Id] int id, CancellationToken cancellationToken) => _db.Posts.ToGraphSingleAsync(x => x.Id == id);

    public Task<Connection<EfSource<Post>>> PostsAsync(int? first, int? last, [Id] string? before, [Id] string? after, CancellationToken cancellationToken)
    {
        var query = _db.Posts.OrderBy(x => x.Id);

        return query.ToGraphConnectionAsync(first, last, after, before, 100);
    }

    public Task<EfSource<Comment>> CommentAsync([Id] int id, CancellationToken cancellationToken) => _db.Comments.ToGraphSingleAsync(x => x.Id == id);

    public static string? Test(IResolveFieldContext context)
    {
        var user = context.User;
        var name = user!.FindFirst("name")?.Value;
        return name;
    }
}
