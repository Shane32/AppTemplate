namespace Mutations;

public class PostTests : TestBase
{
    [Fact]
    public async Task Add()
    {
        await Db.SeedAsync<User>();
        var response = await RunQueryAsync("""
            mutation($input: AddPostInput!) {
              posts {
                add(input: $input) {
                  id
                  title
                  content
                  createdAt
                  user {
                    id
                    name
                  }
                }
              }
            }
            """,
            new {
                input = new {
                    title = "Hello",
                    content = "World",
                    userId = 1
                }
            });
        response.ShouldMatchApproved();
    }

    [Fact]
    public async Task Update()
    {
        await Db.SeedAsync<Post>();
        var oldEntry = await Db.FindAsync<Post>(1);
        var response = await RunQueryAsync("""
            mutation($id: ID!, $input: UpdatePostInput!) {
              posts {
                update(id: $id, input: $input) {
                  id
                  title
                  content
                  createdAt
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
                input = new {
                    title = "Hello2",
                    content = "World2"
                }
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
