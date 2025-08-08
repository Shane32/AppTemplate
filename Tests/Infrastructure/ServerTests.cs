namespace Infrastructure;

public class ServerTests : TestBase
{
    [Fact]
    public void Introspection()
    {
        var schema = Services.GetRequiredService<ISchema>();
        var schemaText = schema.Print(new() {
            IncludeDescriptions = true,
            StringComparison = StringComparison.InvariantCultureIgnoreCase,
        });
        schemaText.ShouldMatchApproved(".graphql");
    }
}
