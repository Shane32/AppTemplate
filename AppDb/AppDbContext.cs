namespace AppDb;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users { get; set; }
    public DbSet<Post> Posts { get; set; }
    public DbSet<Comment> Comments { get; set; }
    public static string? Schema => null; //set to a string like "app" to use a specific schema

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        if (Schema != null)
            modelBuilder.HasDefaultSchema(Schema);

        modelBuilder.Entity<Comment>()
                .HasOne(c => c.User)
                .WithMany()
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Restrict);
    }
}
