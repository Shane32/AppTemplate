using Shane32.ConsoleDI;

namespace ConsoleApp.Apps;

[MainMenu("This is a test app.")]
public class TestApp : IMenuOption
{
    private readonly AppDbContext _db;

    public TestApp(AppDbContext db)
    {
        _db = db;
    }

    public async Task RunAsync()
    {

    }
}
