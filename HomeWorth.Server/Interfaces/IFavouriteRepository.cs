using HomeWorth.Server.Helpers;
using HomeWorth.Server.Models;

namespace HomeWorth.Server.Interfaces
{
  public interface IFavouriteRepository
  {
    Task<PagedResult<Favourite>> GetUserFavouritesAsync(string userId, int pageNumber, int pageSize);
    Task<bool> IsFavouriteAsync(string userId, Guid propertyId);
    Task AddFavouriteAsync(string userId, Guid propertyId);
    Task<bool> RemoveFavouriteAsync(string userId, Guid propertyId);
  }
}
