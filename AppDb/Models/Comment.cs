namespace AppDb.Models;

public class Comment
{
    [Key]
    public int Id { get; set; }

    public required string Content { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    [ForeignKey("Post")]
    public int PostId { get; set; }
    public Post? Post { get; set; }

    [ForeignKey("User")]
    public int UserId { get; set; }
    public User? User { get; set; }
}
