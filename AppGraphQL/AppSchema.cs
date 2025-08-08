namespace AppGraphQL;

public sealed class AppSchema : Schema
{
    public AppSchema(IServiceProvider services) : base(services)
    {
        Query = services.GetRequiredService<QueryType>();
        Mutation = services.GetRequiredService<DIObjectGraphType<Mutation>>();
    }
}
