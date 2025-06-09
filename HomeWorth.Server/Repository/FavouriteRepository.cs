using HomeWorth.Server.Data;
using HomeWorth.Server.Helpers;
using HomeWorth.Server.Interfaces;
using HomeWorth.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace HomeWorth.Server.Repository
{
  public class FavouriteRepository : IFavouriteRepository
  {
    private readonly ApplicationDbContext _context;

    public FavouriteRepository(ApplicationDbContext context)
    {
      _context = context;
    }

    public async Task AddFavouriteAsync(string userId, Guid propertyId)
    {
      if (await IsFavouriteAsync(userId, propertyId))
        return;

      var favourite = new Favourite
      {
        buyerId = userId,
        propertyId = propertyId
      };

      _context.Favourites.Add(favourite);
      await _context.SaveChangesAsync();
    }

    public async Task<PagedResult<Favourite>> GetUserFavouritesAsync(string userId, int pageNumber, int pageSize)
    {

      var query = _context.Favourites
        .Include(f => f.Property)
          .ThenInclude(p => p.images)
        .Where(f => f.buyerId == userId);

      var totalCount = await query.CountAsync();

      var data = await query
          .Skip((pageNumber - 1) * pageSize)
          .Take(pageSize)
          .ToListAsync();

      return new PagedResult<Favourite>
      {
        Data = data,
        TotalCount = totalCount
      };

    }

    public async Task<bool> IsFavouriteAsync(string userId, Guid propertyId)
    {
      return await _context.Favourites.AnyAsync(f => f.buyerId == userId && f.propertyId == propertyId);
    }

    public async Task<bool> RemoveFavouriteAsync(string userId, Guid propertyId)
    {
      var fav = await _context.Favourites
          .FirstOrDefaultAsync(f => f.buyerId == userId && f.propertyId == propertyId);
      if (fav == null) return false;
      _context.Favourites.Remove(fav);
      await _context.SaveChangesAsync();
      return true;
    }
  


  }
}
