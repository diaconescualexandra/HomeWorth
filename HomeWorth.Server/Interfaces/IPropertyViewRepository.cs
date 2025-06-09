using HomeWorth.Server.DTOs.Property;
using HomeWorth.Server.Models;

namespace HomeWorth.Server.Interfaces
{
  public interface IPropertyViewRepository
  {
    Task<Dictionary<Guid, int>> GetPropertyViewCountsAsync(List<Guid> propertyIds);
    Task AddOrUpdatePropertyViewAsync(string userId, Guid propertyId);
    Task<List<PropertyDto>> GetMostViewedPropertiesAsync(int count);
  }
}
