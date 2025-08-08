namespace TestDb;

/// <summary>
/// An abstract class that represents a seed operation for a specific type in a database.
/// </summary>
public abstract class Seed<T> : Shane32.SeedHelpers.Seed<TestDbContext, T>
{
}
