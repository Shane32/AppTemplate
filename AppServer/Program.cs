using Azure.Identity;

namespace AppServer;

public class Program
{
    public static void Main(string[] args)
    {
        // read appsettings.json and environment variables
        var preliminaryConfiguration = new ConfigurationBuilder()
            .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
            .AddUserSecrets<Program>()
            .AddEnvironmentVariables()
            .Build();

        // get the key vault name to be used
        var keyVaultName = preliminaryConfiguration["KeyVaultName"];

        // create the host builder and load the azure key vault with the specified name
        var builder = WebApplication.CreateBuilder(args);
        builder.Host
            .UseDefaultServiceProvider(o => {
                // always validate that scoped services are not pulled from the root container
                o.ValidateScopes = true; // defaults to true only in development
                // always validate that all dependencies can be resolved
                o.ValidateOnBuild = true; // defaults to false
            })
            .ConfigureAppConfiguration(o2 => {
                o2.AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true);
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
        startup.Configure(app, app.Environment);
        app.Run();
    }
}
