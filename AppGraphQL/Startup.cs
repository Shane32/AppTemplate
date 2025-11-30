#pragma warning disable IDE0060 // Remove unused parameter
using System.Reflection;
using System.Text.Json;
using GraphQL.Execution;
using GraphQL.Linq.EntityFrameworkCore8;
using Microsoft.Extensions.Configuration;

namespace AppGraphQL;

public class Startup
{
    private static readonly Action<ILogger, string, string, Exception?> _logFieldError = LoggerMessage.Define<string, string>(LogLevel.Error, 1, "Unhandled exception in GraphQL execution at {Location}: {Message}");
    private static readonly Action<ILogger, string, Exception?> _logError = LoggerMessage.Define<string>(LogLevel.Error, 1, "Unhandled exception in GraphQL execution: {Message}");

    public static void ConfigureGraphQL(IServiceCollection services, IConfiguration configuration)
    {
        var persistedDocuments = ReadPersistedDocuments();

        services.AddGraphQL(b => b
            .AddSystemTextJson()
            .AddSchema<AppSchema>()
#if DEBUG
            .AddErrorInfoProvider(x => x.ExposeExceptionDetails = true)
#endif
            .AddExecutionStrategy<SerialExecutionStrategy>(GraphQLParser.AST.OperationType.Query)
            .AddScopedSubscriptionExecutionStrategy()
            .AddGraphTypes()
            .AddClrTypeMappings()
            .AddDI()
            .AddAutoClrMappings(true, false)
            .AddLinq<AppDbContext>()
            .AddUnhandledExceptionHandler(ctx => {
                var logger = (ctx.FieldContext?.RequestServices ?? ctx.Context?.RequestServices)?.GetRequiredService<ILogger<Startup>>();
                if (logger == null)
                    return;
                if (ctx.FieldContext != null) {
                    _logFieldError(logger, string.Join('.', ctx.FieldContext.ResponsePath.Select(x => x.ToString())), ctx.Exception.Message, ctx.Exception);
                } else {
                    _logError(logger, ctx.Exception.Message, ctx.Exception);
                }
            })
            .AddJwtBearerAuthentication()
            .UsePersistedDocuments(o => {
                o.AllowOnlyPersistedDocuments = false;
                o.AllowedPrefixes.Clear();
                o.AllowedPrefixes.Add(null);
                o.GetQueryDelegate = (options, prefix, hash) => persistedDocuments == null || !persistedDocuments.TryGetValue(hash, out var query) ? default : new(query);
            })
            .ValidateServices()
        );
    }

    /// <summary>
    /// Reads persisted documents from persisted-documents.json file (if exists, for production) or embedded resource.
    /// </summary>
    private static Dictionary<string, string>? ReadPersistedDocuments()
    {
#if DEBUG // pull the embedded resource in debug mode
        // read AppGraphQL.persisted-documents.json embedded resource
        using var stream = Assembly.GetExecutingAssembly().GetManifestResourceStream("AppGraphQL.persisted-documents.json");
        if (stream == null)
            return null;
        using var reader = new StreamReader(stream);
        // read file
        var persistedDocuments = reader.ReadToEnd();
        // deserialize persisted documents
        return JsonSerializer.Deserialize<Dictionary<string, string>>(persistedDocuments);
#else // pull the persisted-documents.json file in production mode
        // get dll directory
        var dllDir = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location)
            ?? throw new InvalidOperationException("Could not get the directory of the executing assembly.");
        // append persisted-documents.json
        var persistedDocumentsPath = Path.Combine(dllDir, "persisted-documents.json");
        // read file
        var persistedDocuments = File.ReadAllText(persistedDocumentsPath);
        // deserialize persisted documents
        return JsonSerializer.Deserialize<Dictionary<string, string>>(persistedDocuments);
#endif
    }
}
