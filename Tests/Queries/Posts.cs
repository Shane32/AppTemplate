namespace Queries;

public class Posts : TestBase
{
    [Fact]
    public async Task Get()
    {
        await Db.SeedAsync<Comment>();
        var response = await RunQueryAsync("""
            query {
              posts {
                items {
                  id
                  title
                  content
                  userId
                  user {
                    id
                    name
                  }
                  comments {
                    id
                    content
                    userId
                    user {
                      id
                      name
                    }
                    postId
                    post {
                      id
                      title
                    }
                  }
                }
                totalCount
                pageInfo {
                  startCursor
                  endCursor
                  hasNextPage
                  hasPreviousPage
                }
              }
            }
            """);
        response.ShouldMatchApproved();
    }
}
