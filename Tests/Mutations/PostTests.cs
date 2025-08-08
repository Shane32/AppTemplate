namespace Mutations;

public class PostTests : TestBase
{
    [Fact]
    public async Task Add()
    {
        await Db.SeedAsync<User>();
        var response = await RunQueryAsync("""
            mutation($title: String!, $content: String!, $userId: ID!) {
              posts {
                add(title: $title, content: $content, userId: $userId) {
                  id
                  title
                  content
                  user {
                    id
                    name
                  }
                }
              }
            }
            """,
            new {
                title = "Hello",
                content = "World",
                userId = 1
            });
        response.ShouldMatchApproved();
    }

    [Fact]
    public async Task Update()
    {
        await Db.SeedAsync<Post>();
        var oldEntry = await Db.FindAsync<Post>(1);
        var response = await RunQueryAsync("""
            mutation($id: ID!, $title: String!, $content: String!) {
              posts {
                update(id: $id, title: $title, content: $content) {
                  id
                  title
                  content
                  user {
                    id
                    name
                  }
                }
              }
            }
            """,
            new {
                id = 1,
                title = "Hello2",
                content = "World2"
            });
        var newEntry = await Db.FindAsync<Post>(1);
        var actual = new {
            oldEntry,
            newEntry,
            response,
        };
        actual.ShouldMatchApproved();
    }

    [Fact]
    public async Task Delete()
    {
        await Db.SeedAsync<Comment>();
        (await Db.Comments.CountAsync()).ShouldBe(1);
        var response = await RunQueryAsync("""
            mutation($id: ID!) {
              posts {
                delete(id: $id)
              }
            }
            """,
            new {
                id = 1
            });
        response.ShouldBeSuccessful();
        (await Db.Comments.CountAsync()).ShouldBe(0);
    }
}
