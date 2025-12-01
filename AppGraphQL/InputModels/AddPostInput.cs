namespace AppGraphQL.InputModels;

/// <summary>
/// Input model for adding a new post.
/// </summary>
public class AddPostInput
{
    public required string Title { get; set; }
    public required string Content { get; set; }
    public required int UserId { get; set; }
}
