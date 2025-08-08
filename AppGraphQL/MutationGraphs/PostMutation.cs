namespace AppGraphQL.MutationGraphs;

public class PostMutation : DIObjectGraphBase
{
    private readonly AppDbContext _db;

    public PostMutation(AppDbContext db)
    {
        _db = db;
    }

    public async Task<EfSource<Post>> AddAsync(string title, string content, [Id] int userId, CancellationToken cancellationToken)
    {
        var post = new Post {
            Title = title,
            Content = content,
            CreatedAt = DateTimeOffset.UtcNow,
            UserId = userId,
        };
        _db.Posts.Add(post);
        await _db.SaveChangesAsync(cancellationToken);
        return await _db.Posts.ToGraphSingleAsync(x => x.Id == post.Id);
    }

    public async Task<EfSource<Post>> UpdateAsync([Id] int id, string title, string content, CancellationToken cancellationToken)
    {
        var post = await _db.Posts.FindAsync([id], cancellationToken)
            ?? throw new ExecutionError("Post not found");
        post.Title = title;
        post.Content = content;
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
