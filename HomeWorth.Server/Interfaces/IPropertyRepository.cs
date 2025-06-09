using HomeWorth.Server.DTOs.Property;
using HomeWorth.Server.Helpers;
using HomeWorth.Server.Models;

namespace HomeWorth.Server.Interfaces
{
  public interface IPropertyRepository
  {
    Task<Property?> UpdateStatusAsync(Guid propertyId, PropertyStatus status);
    Task<(Property property, bool isDuplicate)> CreateWithDuplicateCheckAsync(Property propertyModel, string userId, List<int>? facilityIds);
    Task <PagedResult<Property>> GetAllAsync(QueryObject query);
    Task<Property?> GetByIdAsync(Guid propertyId);
    //Task<Property> CreateAsync(Property propertyModel, string userId, List<int>? facilityIds);
    Task<Property> UpdateAsync(Guid propertyId, UpdatePropertyRequestDto propertyDto, string userId);
    Task<Property> DeleteAsync(Guid propertyId, string userId);
    Task <PagedResult<Property>> GetAllPropertiesBySellerIdAsync(string sellerId, QueryObject query);
  }
}
