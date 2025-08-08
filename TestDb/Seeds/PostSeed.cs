namespace TestDb.Seeds;

internal class PostSeed : Seed<Post>
{
    public override async Task SeedAsync(TestDbContext db, CancellationToken cancellationToken = default)
    {
        await db.SeedAsync<User>(cancellationToken);

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
