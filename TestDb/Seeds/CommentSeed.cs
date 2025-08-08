namespace TestDb.Seeds;

internal class CommentSeed : Seed<Comment>
{
    public override async Task SeedAsync(TestDbContext db, CancellationToken cancellationToken = default)
    {
        await db.SeedAsync<Post>(cancellationToken);

        var createdAt = DateTimeOffset.Parse("2024-10-25T00:01:00Z", CultureInfo.InvariantCulture);

        db.Add(new Comment {
            Id = 1,
            Content = "Hello there!",
            PostId = 1,
            UserId = 1,
            CreatedAt = createdAt,
        });
    }
}
