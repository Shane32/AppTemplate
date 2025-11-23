using System.Security.Claims;
using AppServer;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.Hosting;
using Microsoft.Identity.Web;
using Shane32.TestHelpers;
using TestDb;

namespace Tests;

/// <summary>
/// Represents the base class for GraphQL testing.
/// </summary>
public class TestBase : GraphQLTestBase<Startup>
{
    /// <summary>
    /// Gets or sets the user ID to use for testing.
    /// </summary>
    protected int UserId { get; set; } = 1;

    /// <inheritdoc/>
    protected override async Task<IEnumerable<Claim>> GetClaimsAsync()
    {
        var claims = (await base.GetClaimsAsync()).ToList();
        if (!claims.Any(x => x.Type == ClaimConstants.NameIdentifierId)) {
            var jwtSubject = (await Db.Users.FindAsync(UserId))?.JwtSubject;
            if (jwtSubject != null)
                claims.Add(new(ClaimConstants.NameIdentifierId, jwtSubject));
        }
        return claims;
    }

    /// <summary>
    /// Gets the test database context.
    /// </summary>
    protected TestDbContext Db => (TestDbContext)Services.GetRequiredService<AppDbContext>();

    /// <inheritdoc/>
    protected override void ConfigureWebHostBuilder(IWebHostBuilder webHostBuilder)
    {
        base.ConfigureWebHostBuilder(webHostBuilder);

        webHostBuilder
            .ConfigureTestServices(services => {
                // reconfigure database connection to use the SQLite in-memory database
                services.AddSingleton(_ => {
                    var c = new SqliteConnection("Data Source=:memory:");
                    c.Open();
                    return c;
                });
                services.AddSingleton<AppDbContext>(provider => {
                    var db = new TestDbContext(provider.GetRequiredService<SqliteConnection>());
                    db.Database.EnsureCreated();
                    db.ResetDbTrace();
                    return db;
                });
                // disable background services (which may interfere with tests or attempt to concurrently access the singleton database)
                var servicesToRemove = services.Where(sd => sd.ServiceType == typeof(IHostedService)).ToList();
                foreach (var sd in servicesToRemove) {
                    services.Remove(sd);
                }
            });
    }

    /// <inheritdoc/>
    public override Task<ExecutionResponse> RunQueryAsync(string query, object? variables = null) => RunQueryAsync(query, variables, true);

    /// <inheritdoc cref="RunQueryAsync(string, object?)"/>
    /// <param name="noTracking">Whether to clear the change tracker before and after running the query.</param>
    public async Task<ExecutionResponse> RunQueryAsync(string query, object? variables = null, bool noTracking = true)
    {
        if (noTracking)
            Db.ChangeTracker.Clear();
        var response = await base.RunQueryAsync(query, variables);
        if (noTracking)
            Db.ChangeTracker.Clear();
        return response;
    }
}
