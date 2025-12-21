using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Shane32.ConsoleDI;

namespace ConsoleApp;

internal sealed class Program
{
    private static async Task Main(string[] args)
       => await ConsoleHost.RunMainMenu(args, CreateHostBuilder, "HiveConsole");

    public static IHostBuilder CreateHostBuilder(string[] args)
    {
        // read appsettings.json and environment variables
        var preliminaryConfiguration = new ConfigurationBuilder()
            .AddJsonFile("appsettings.json", optional: true, reloadOnChange: false)
            .AddEnvironmentVariables()
            .AddUserSecrets<Program>()
            .Build();

        var builder = ConsoleHost.CreateHostBuilder(args, ConfigureServices);

        return builder;
    }

    private static void ConfigureServices(HostBuilderContext context, IServiceCollection services)
    {
        services.AddSingleton(context.Configuration);

        var connectionString = context.Configuration.GetConnectionString("AppDbContext") ?? throw new InvalidOperationException("Could not find AppDbContext connection string");

        services.AddDbContext<AppDbContext>(options => options.UseSqlServer(connectionString));
    }
}
