namespace TestDb.Seeds;

internal class UserSeed : Seed<User>
{
    public override async Task SeedAsync(TestDbContext db, CancellationToken cancellationToken = default)
    {
        db.Add(new User {
            Id = 1,
            JwtSubject = "00000000-0000-0000-0000-000000000001",
            Name = "Alice",
            Email = ""
        });
    }
}
