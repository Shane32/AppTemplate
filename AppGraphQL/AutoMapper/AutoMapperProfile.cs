using AppGraphQL.InputModels;
using AutoMapper;

namespace AppGraphQL.AutoMapper;

/// <summary>
/// AutoMapper profile for mapping between GraphQL input types and database models.
/// </summary>
public class AutoMapperProfile : Profile
{
    public AutoMapperProfile(TimeProvider timeProvider)
    {
        // Map AddPostInput to Post entity
        // This demonstrates mapping from mutation input parameters to a database model
        CreateMap<AddPostInput, Post>()
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(_ => timeProvider.GetUtcNow()));

        // Map UpdatePostInput to Post entity
        CreateMap<UpdatePostInput, Post>();
    }
}
