using HomeWorth.Server.DTOs.Favourite;
using HomeWorth.Server.DTOs.Property;
using HomeWorth.Server.Models;

namespace HomeWorth.Server.Mappers
{
  public static class FavouriteMappers
  {
    public static FavouriteDto ToDto(this Favourite favourite)
    {
      if (favourite == null)
        return null;

      return new FavouriteDto
      {
        favouriteId = favourite.favouriteId,
        propertyId = favourite.propertyId,
        title = favourite.Property?.title,
        description = favourite.Property?.description,
        price = favourite.Property?.price ?? 0,
        city = favourite.Property?.city,
        neighborhood = favourite.Property?.neighborhood,
        images = favourite.Property.images?
            .Select(i => new ImageResponseDto
            {
              imageId = i.imageId,
              imageUrl = i.imageUrl
            })
            .ToList() ?? new List<ImageResponseDto>()
      };
    }

    public static List<FavouriteDto> ToDtoList(this IEnumerable<Favourite> favourites)
    {
      return favourites?.Select(f => f.ToDto()).ToList() ?? new List<FavouriteDto>();
    }

    public static Favourite ToEntity(this AddFavouriteRequestDto requestDto, string userId)
    {
      if (requestDto == null)
        return null;

      return new Favourite
      {
        propertyId = requestDto.propertyId,
        buyerId = userId
      };
    }
  }
}

