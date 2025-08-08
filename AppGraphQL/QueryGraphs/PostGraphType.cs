namespace AppGraphQL.QueryGraphs;

public class PostGraphType : EfObjectGraphType<AppDbContext, Post>
{
    public PostGraphType()
    {
        EfIdField(x => x.Id);
        EfField(x => x.Title);
        EfField(x => x.Content);
        EfIdField(x => x.UserId);
        EfField(x => x.CreatedAt);

        EfField("User", x => x.UserId)
            .DelayLoadEntry(ctx => ctx.DbContext.Users, x => x.Id);

        EfField("Comments", x => x.Id)
            .DelayLoadList(ctx => ctx.DbContext.Comments.OrderBy(x => x.Id), x => x.PostId);
    }
}
