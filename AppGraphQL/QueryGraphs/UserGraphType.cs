namespace AppGraphQL.QueryGraphs;

public class UserGraphType : EfObjectGraphType<AppDbContext, User>
{
    public UserGraphType()
    {
        EfIdField(x => x.Id);
        EfField(x => x.Name);
        EfField(x => x.FirstName);
        EfField(x => x.LastName);
        EfField(x => x.Email);
        EfField(x => x.Roles)
            .ThenResolve(role => Enum.GetValues<Role>().Where(r => r != 0 && role.HasFlag(r)));
    }
}
