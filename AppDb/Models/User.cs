namespace AppDb.Models;

[Index(nameof(JwtSubject), IsUnique = true)]
public class User
{
    [Key]
    public int Id { get; set; }

    [MaxLength(255)]
    public required string JwtSubject { get; set; }

    [MaxLength(50)]
    public string? Name { get; set; }

    [MaxLength(50)]
    public string? FirstName { get; set; }

    [MaxLength(50)]
    public string? LastName { get; set; }

    [MaxLength(100)]
    public string? Email { get; set; }

    public Role Roles { get; set; }

    public ICollection<Post>? Posts { get; set; }
}
