namespace AppGraphQL.QueryGraphs;

public class CommentGraphType : EfObjectGraphType<AppDbContext, Comment>
{
    public CommentGraphType()
    {
        EfIdField(x => x.Id);
        EfField(x => x.Content);
        EfField(x => x.CreatedAt);
        EfIdField(x => x.PostId);
        EfIdField(x => x.UserId);

        EfField("Post", x => x.PostId)
            .DelayLoadEntry(x => x.DbContext.Posts, x => x.Id);

        EfField("User", x => x.UserId)
            .DelayLoadEntry(x => x.DbContext.Users, x => x.Id);
    }
}
