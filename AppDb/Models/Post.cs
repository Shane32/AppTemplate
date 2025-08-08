namespace AppDb.Models;

public class Post
{
    [Key]
    public int Id { get; set; }

    [MaxLength(255)]
    public required string Title { get; set; }

    [MaxLength(int.MaxValue)]
    public required string Content { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    [ForeignKey("User")]
    public int UserId { get; set; }
    public User? User { get; set; }

    public ICollection<Comment>? Comments { get; set; }
}
