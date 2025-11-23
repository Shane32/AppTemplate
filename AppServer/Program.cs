using Azure.Identity;

namespace AppServer;

public class Program
{
    public static async Task Main(string[] args)
    {
        // first, read the configuration to get the key vault name (if specified)
        // the key vault name can be specified within appsettings.json, user secrets or environment variables

        // read appsettings.json, user secrets and environment variables
        var preliminaryConfiguration = new ConfigurationBuilder()
            .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
            .AddUserSecrets<Program>()
            .AddEnvironmentVariables()
            .Build();

        // get the key vault name to be used
        var keyVaultName = preliminaryConfiguration["KeyVaultName"];

        // then, create the host builder and load the azure key vault with the specified name
        var builder = WebApplication.CreateBuilder(args);
        builder.Host
            .UseDefaultServiceProvider(o => {
                // always validate that scoped services are not pulled from the root container
                o.ValidateScopes = true; // defaults to true only in development
                // always validate that all dependencies can be resolved
                o.ValidateOnBuild = true; // defaults to false
            })
            .ConfigureAppConfiguration(o2 => {
                // also load appsettings.Local.json
                o2.AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true);
                // load azure key vault secrets if a key vault name was provided
                if (!string.IsNullOrEmpty(keyVaultName)) {
                    o2.AddAzureKeyVault(
                        new Uri($"https://{keyVaultName}.vault.azure.net/"),
#if DEBUG
                        new VisualStudioCredential());
#else
                        new DefaultAzureCredential());
#endif
                }
            });

        // configure services and start the application
        var startup = new Startup(builder.Configuration);
        startup.ConfigureServices(builder.Services);
        var app = builder.Build();
        if (app.Environment.EnvironmentName != "Test") {
            await startup.RunInitializationTestsAsync(app.Services);
        }
        startup.Configure(app, app.Environment);
        app.Run();
    }
}
