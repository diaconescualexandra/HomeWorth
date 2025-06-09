using HomeWorth.Server.Data;
using HomeWorth.Server.DTOs.Property;
using HomeWorth.Server.Interfaces;
using HomeWorth.Server.Mappers;
using HomeWorth.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace HomeWorth.Server.Repository
{
  public class PropertyViewRepository : IPropertyViewRepository
  {
    private readonly ApplicationDbContext _context;

    public PropertyViewRepository(ApplicationDbContext context)
    {
      _context = context;
    }

    public async Task<Dictionary<Guid, int>> GetPropertyViewCountsAsync(List<Guid> propertyIds)
    {
      return await _context.PropertyViews
          .Where(pv => propertyIds.Contains(pv.propertyId))
          .GroupBy(pv => pv.propertyId)
          .Select(g => new { PropertyId = g.Key, TotalViews = g.Sum(pv => pv.viewsCount) })
          .ToDictionaryAsync(x => x.PropertyId, x => x.TotalViews);
    }

    public async Task AddOrUpdatePropertyViewAsync(string userId, Guid propertyId)
    {
      // Check if there's an existing view for this user and property
      var existingView = await _context.PropertyViews
          .FirstOrDefaultAsync(pv => pv.buyerId == userId && pv.propertyId == propertyId);

      if (existingView != null)
      {
        // Update the existing view
        existingView.viewsCount++;
        existingView.viewedAt = DateTime.UtcNow;
      }
      else
      {
        // Create a new view record
        var propertyView = new PropertyView
        {
          buyerId = userId,
          propertyId = propertyId,
          viewsCount = 1,
          viewedAt = DateTime.UtcNow
        };
        _context.PropertyViews.Add(propertyView);
      }

      await _context.SaveChangesAsync();
    }

    public async Task<List<PropertyDto>> GetMostViewedPropertiesAsync(int count)
    {
      // Step 1: Get the property IDs with the highest view counts
      var mostViewedPropertyIds = await _context.PropertyViews
          .GroupBy(pv => pv.propertyId)
          .Select(g => new
          {
            PropertyId = g.Key,
            TotalViews = g.Sum(pv => pv.viewsCount)
          })
          .OrderByDescending(x => x.TotalViews)
          .Take(count)
          .Select(x => x.PropertyId)
          .ToListAsync();

      // Step 2: Fetch the complete property data for these IDs, including all related data
      var properties = await _context.Properties
          .Include(p => p.images)
          .Include(p => p.PropertyFacilities)
              .ThenInclude(pf => pf.Facility)
          .Include(p => p.PropertyViews)
          .Include(p => p.Offers)
          .Where(p => mostViewedPropertyIds.Contains(p.propertyId))
          .ToListAsync();

      // Step 3: Map the view counts back to the properties
      var viewCountsDict = await _context.PropertyViews
          .Where(pv => mostViewedPropertyIds.Contains(pv.propertyId))
          .GroupBy(pv => pv.propertyId)
          .Select(g => new
          {
            PropertyId = g.Key,
            TotalViews = g.Sum(pv => pv.viewsCount)
          })
          .ToDictionaryAsync(x => x.PropertyId, x => x.TotalViews);

      // Step 4: Create the DTOs with the correct view counts
      var result = new List<PropertyDto>();
      foreach (var property in properties)
      {
        // Use the provided mapper
        var propertyDto = property.ToPropertyDto();

        // Update the view count with the aggregated total
        if (viewCountsDict.TryGetValue(property.propertyId, out var viewCount) && propertyDto.PropertyViews != null)
        {
          propertyDto.PropertyViews.viewsCount = viewCount;
        }

        result.Add(propertyDto);
      }

      // Step 5: Make sure the result is in the correct order (by view count)
      return result
          .OrderByDescending(p => p.PropertyViews?.viewsCount ?? 0)
          .ToList();
    }

  }
}
