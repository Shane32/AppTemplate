using System.Diagnostics;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Microsoft.Extensions.Logging;
using Shane32.SeedHelpers;

namespace TestDb;

public class TestDbContext : AppDbContext
{
    private readonly StringBuilder _logBuilder = new();
    private readonly SeedHandler<TestDbContext> _seedHandler;

    public TestDbContext(SqliteConnection connection) : base(new DbContextOptionsBuilder<AppDbContext>().UseSqlite(connection).Options)
    {
        _seedHandler = new(this);
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        base.OnConfiguring(optionsBuilder);
        optionsBuilder.LogToStringBuilder(_logBuilder, enableSensitiveDataLogging: true);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.PrepForSqlite();
    }

    public void ResetDbTrace(bool resetChangeTracker = true)
    {
        if (resetChangeTracker)
            ChangeTracker.Clear();
        _logBuilder.Clear();
    }

    public string DbTrace => _logBuilder.ToString();

    public Task SeedAsync<T>(CancellationToken cancellationToken = default)
        => SeedAsync(typeof(T), cancellationToken);

    private async Task SeedAsync(Type type, CancellationToken cancellationToken)
    {
        await _seedHandler.SeedAsync(type, cancellationToken);
        await SaveChangesAsync(cancellationToken);
        ResetDbTrace(true);
    }

    public async Task SeedAllAsync(CancellationToken cancellationToken = default)
    {
        await _seedHandler.SeedAllAsync(cancellationToken);
        await SaveChangesAsync(cancellationToken);
        ResetDbTrace(true);
    }

    public static IEnumerable<Type> GetSeedTypes()
    {
        return SeedHandler<TestDbContext>.GetSeedTypes();
    }
}
