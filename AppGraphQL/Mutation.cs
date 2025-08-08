using AppGraphQL.MutationGraphs;

namespace AppGraphQL;

[Authorize(Policy = SecurityPolicies.MUTATION_POLICY)]
public sealed class Mutation : DIObjectGraphBase
{
    [DIGraph(typeof(PostMutation))]
    public static string Posts() => string.Empty;
}
