using AppGraphQL.InputModels;
using AutoMapper;

namespace AppGraphQL.MutationGraphs;

public class PostMutation : DIObjectGraphBase
{
    private readonly AppDbContext _db;
    private readonly IMapper _mapper;

    public PostMutation(AppDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<EfSource<Post>> AddAsync(AddPostInput input, CancellationToken cancellationToken)
    {
        var post = _mapper.Map<Post>(input);
        _db.Posts.Add(post);
        await _db.SaveChangesAsync(cancellationToken);
        return await _db.Posts.ToGraphSingleAsync(x => x.Id == post.Id);
    }

    public async Task<EfSource<Post>> UpdateAsync([Id] int id, UpdatePostInput input, CancellationToken cancellationToken)
    {
        var post = await _db.Posts.FindAsync([id], cancellationToken)
            ?? throw new ExecutionError("Post not found");
        _mapper.Map(input, post);
        await _db.SaveChangesAsync(cancellationToken);
        return await _db.Posts.ToGraphSingleAsync(x => x.Id == post.Id);
    }

    public async Task<bool> DeleteAsync([Id] int id, CancellationToken cancellationToken)
    {
        var post = await _db.Posts.FindAsync([id], cancellationToken)
            ?? throw new ExecutionError("Post not found");
        _db.Posts.Remove(post);
        await _db.SaveChangesAsync(cancellationToken);
        return true;
    }
}
