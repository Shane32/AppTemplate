namespace AppGraphQL.MutationGraphs;

public class CommentMutation : DIObjectGraphBase
{
    private readonly AppDbContext _db;
    public CommentMutation(AppDbContext db)
    {
        _db = db;
    }

    public async Task<EfSource<Comment>> AddAsync(string content, [Id] int userId, [Id] int postId, CancellationToken cancellationToken)
    {
        var comment = new Comment {
            Content = content,
            CreatedAt = DateTimeOffset.UtcNow,
            UserId = userId,
            PostId = postId,
        };
        _db.Comments.Add(comment);
        await _db.SaveChangesAsync(cancellationToken);
        return await _db.Comments.ToGraphSingleAsync(x => x.Id == comment.Id);
    }

    public async Task<EfSource<Comment>> UpdateAsync([Id] int id, string content, CancellationToken cancellationToken)
    {
        var comment = await _db.Comments.FindAsync([id], cancellationToken)
            ?? throw new ExecutionError("Comment not found");
        comment.Content = content;
        await _db.SaveChangesAsync(cancellationToken);
        return await _db.Comments.ToGraphSingleAsync(x => x.Id == comment.Id);
    }

    public async Task<bool> DeleteAsync([Id] int id, CancellationToken cancellationToken)
    {
        var comment = await _db.Comments.FindAsync([id], cancellationToken)
            ?? throw new ExecutionError("Comment not found");
        _db.Comments.Remove(comment);
        await _db.SaveChangesAsync(cancellationToken);
        return true;
    }
}
