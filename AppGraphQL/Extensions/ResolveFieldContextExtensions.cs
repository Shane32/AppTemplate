using System.Security.Claims;

namespace AppGraphQL.Extensions;

internal static class ResolveFieldContextExtensions
{
    public static int GetUserId(this IResolveFieldContext context)
        => int.Parse(context.User!.FindFirstValue("DbUserId")!, CultureInfo.InvariantCulture);
}
