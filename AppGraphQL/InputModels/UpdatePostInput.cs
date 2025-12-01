namespace AppGraphQL.InputModels;

/// <summary>
/// Input model for updating an existing post.
/// </summary>
public class UpdatePostInput
{
    public required string Title { get; set; }
    public required string Content { get; set; }
}
