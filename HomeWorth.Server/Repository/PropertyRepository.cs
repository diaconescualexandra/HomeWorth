using HomeWorth.Server.Data;
using HomeWorth.Server.DTOs.Property;
using HomeWorth.Server.Helpers;
using HomeWorth.Server.Interfaces;
using HomeWorth.Server.Models;
using Microsoft.EntityFrameworkCore;
using FuzzySharp;

namespace HomeWorth.Server.Repository
{
  public class PropertyRepository : IPropertyRepository
  {
    private readonly ApplicationDbContext _context;

    public PropertyRepository(ApplicationDbContext context)
    {
      _context = context;
    }
    private async Task<bool> IsDuplicatePropertyAsync(Property property, string userId)
    {
      var userProperties = await _context.Properties
          .Where(p => p.SellerId == userId)
          .ToListAsync();

      foreach (var existing in userProperties)
      {
        // Fuzzy match title and description, exact match location
        int titleScore = Fuzz.Ratio(property.title, existing.title);
        int descScore = Fuzz.Ratio(property.description, existing.description);
        bool sameLocation = property.city == existing.city && property.address == existing.address;

        if (titleScore > 80 && sameLocation)
          return true;
        if (descScore > 80 && sameLocation)
          return true;
      }
      return false;
    }

    public async Task <PagedResult<Property>> GetAllPropertiesBySellerIdAsync(string sellerId, QueryObject query)
    {
      var properties = _context.Properties
          .Include(p => p.images)
          .Include(p => p.PropertyFacilities)
              .ThenInclude(pf => pf.Facility)
          .Include(p => p.PropertyViews) // views for popularity sorting
          .Include(p => p.Offers) 
          .Where(p => p.SellerId == sellerId)
          .AsQueryable();

      // Add search term filtering
      if (!string.IsNullOrWhiteSpace(query.SearchTerm))
      {
        properties = properties.Where(p =>
            p.title.Contains(query.SearchTerm) ||
            p.description.Contains(query.SearchTerm) ||
            p.city.Contains(query.SearchTerm) ||
            p.neighborhood.Contains(query.SearchTerm) ||
            p.address.Contains(query.SearchTerm)
        );
      }

      if (query.PropertyType.HasValue)
      {
        properties = properties.Where(p => p.PropertyType == query.PropertyType.Value);
      }

      if (!string.IsNullOrWhiteSpace(query.noOfRooms))
      {
        properties = properties.Where(p => p.noOfRooms.Contains(query.noOfRooms));
      }

      if (query.MinPrice.HasValue)
      {
        properties = properties.Where(p => p.price >= query.MinPrice.Value);
      }

      if (query.MaxPrice.HasValue)
      {
        properties = properties.Where(p => p.price <= query.MaxPrice.Value);
      }

      // Apply sorting based on SortBy parameter
      if (!string.IsNullOrWhiteSpace(query.SortBy))
      {
        switch (query.SortBy.ToLower())
        {
          case "price":
          case "price_low_to_high":
            properties = query.IsDescending ? properties.OrderByDescending(p => p.price) : properties.OrderBy(p => p.price);
            break;
          case "size":
          case "size_small_to_large":
            properties = query.IsDescending ? properties.OrderByDescending(p => p.size) : properties.OrderBy(p => p.size);
            break;
          case "year":
          case "year_newest_first":
            properties = query.IsDescending ? properties.OrderBy(p => p.yearBuilt) : properties.OrderByDescending(p => p.yearBuilt);
            break;
          case "popularity":
            properties = properties.OrderByDescending(p => p.PropertyViews.Count);
            break;
          default:
            properties = properties.OrderByDescending(p => p.date);
            break;
        }
      }
      else
      {
        // Default sorting if SortBy is not specified
        properties = properties.OrderByDescending(p => p.date);
      }

      // Add pagination
      var totalCount = await properties.CountAsync();
      var skipNumber = (query.PageNumber - 1) * query.PageSize;
      var results = await properties.Skip(skipNumber).Take(query.PageSize).ToListAsync();

      return new PagedResult<Property>
      {
        Data = results,
        TotalCount = totalCount
      };
    }

    public async Task<(Property property, bool isDuplicate)> CreateWithDuplicateCheckAsync(Property propertyModel, string userId, List<int>? facilityIds)
    {
      propertyModel.SellerId = userId;
      bool isDuplicate = await IsDuplicatePropertyAsync(propertyModel, userId);

      // Set status based on duplicate check
      propertyModel.Status = isDuplicate ? PropertyStatus.Pending : PropertyStatus.Accepted;

      await _context.Properties.AddAsync(propertyModel);
      await _context.SaveChangesAsync();

      if (facilityIds != null && facilityIds.Any())
      {
        foreach (var facilityId in facilityIds)
        {
          var propertyFacility = new PropertyFacility
          {
            propertyId = propertyModel.propertyId,
            facilityId = facilityId
          };
          await _context.PropertyFacilities.AddAsync(propertyFacility);
        }
        await _context.SaveChangesAsync();
      }

      return (propertyModel, isDuplicate);
    }


    public async Task<Property> DeleteAsync(Guid propertyId, string userId)
    {
      var propertyModel = await _context.Properties.FirstOrDefaultAsync(x => x.propertyId == propertyId && x.SellerId == userId);
      if(propertyModel == null)
      {
        return null;
      }
      _context.Properties.Remove(propertyModel);
      await _context.SaveChangesAsync();
      return propertyModel;
    }
    public async Task<Property?> UpdateStatusAsync(Guid propertyId, PropertyStatus status)
    {
      var property = await _context.Properties.FirstOrDefaultAsync(p => p.propertyId == propertyId);
      if (property == null) return null;

      property.Status = status;
      await _context.SaveChangesAsync();
      return property;
    }

    public async Task<PagedResult<Property>> GetAllAsync(QueryObject query)
    {
      var properties = _context.Properties
          .Include(p => p.images)
          .Include(p => p.Seller)
          .Include(p => p.PropertyFacilities)
              .ThenInclude(pf => pf.Facility)
          .AsQueryable();

      if (!query.IncludeAllStatuses && query.Status.HasValue)
      {
        properties = properties.Where(p => p.Status == query.Status.Value);
      }

      // If either floor filter is applied, only show flats
      if (query.ExcludeGroundFloor == true || query.ExcludeTopFloor == true)
      {
        properties = properties.Where(p => p.PropertyType == PropertyType.Flat);

        // Then apply specific floor filters
        if (query.ExcludeGroundFloor == true)
        {
          properties = properties.Where(p =>
              (p as Flat).floorNo > 0);
        }

        if (query.ExcludeTopFloor == true)
        {
          properties = properties.Where(p =>
              (p as Flat).floorNo < (p as Flat).totalFloors);
        }
      }


      if (!string.IsNullOrWhiteSpace(query.SearchTerm))
      {
        properties = properties.Where(p =>
            p.title.Contains(query.SearchTerm) ||
            p.description.Contains(query.SearchTerm) ||
            p.city.Contains(query.SearchTerm) ||
            p.neighborhood.Contains(query.SearchTerm) ||
            p.address.Contains(query.SearchTerm)
        );
      }

      if (query.PropertyType.HasValue)
      {
        properties = properties.Where(p => p.PropertyType == query.PropertyType.Value);
      }

      if(!string.IsNullOrWhiteSpace(query.noOfRooms))
      {
        properties = properties.Where(p => p.noOfRooms.Contains(query.noOfRooms));
      }

      if (query.MinPrice.HasValue)
      {
        properties = properties.Where(p => p.price >= query.MinPrice.Value);
      }

      if (query.MaxPrice.HasValue)
      {
        properties = properties.Where(p => p.price <= query.MaxPrice.Value);
      }

      // Apply sorting based on SortBy parameter
      if (!string.IsNullOrWhiteSpace(query.SortBy))
      {
        switch (query.SortBy.ToLower())
        {
          case "price":
          case "price_low_to_high":
            properties = query.IsDescending ? properties.OrderByDescending(p => p.price) : properties.OrderBy(p => p.price);
            break;
          case "size":
          case "size_small_to_large":
            properties = query.IsDescending ? properties.OrderByDescending(p => p.size) : properties.OrderBy(p => p.size);
            break;
          case "year":
          case "year_newest_first":
            properties = query.IsDescending ? properties.OrderBy(p => p.yearBuilt) : properties.OrderByDescending(p => p.yearBuilt);
            break;
          case "popularity":
            properties = properties.OrderByDescending(p => p.PropertyViews.Count);
            break;
          default:
            properties = properties.OrderByDescending(p => p.date);
            break;
        
      }
      }
      else
      {
        // Default sorting if SortBy is not specified
        properties = properties.OrderByDescending(p => p.date);
      }

      var totalCount = await properties.CountAsync();
      var skipNumber = (query.PageNumber - 1) * query.PageSize;
      var results = await properties.Skip(skipNumber).Take(query.PageSize).ToListAsync();
      return new PagedResult<Property>
      {
        Data = results,
        TotalCount = totalCount
      };
    }

    public async Task<Property?> GetByIdAsync(Guid propertyId)
    {
      return await _context.Properties
        .Include(p => p.images)
        .Include(pf => pf.PropertyFacilities)
          .ThenInclude(f => f.Facility)
        .FirstOrDefaultAsync(p => p.propertyId == propertyId);
    }

    public async Task<Property?> UpdateAsync(Guid propertyId, UpdatePropertyRequestDto updateDto, string userId)
    {
      // Helper methods to detect default/empty values
      bool IsEmptyString(string value)
      {
        return value == null || value == string.Empty || value == "string";
      }

      bool IsDefaultInt(int? value)
      {
        return value == null || value == 0;
      }

      bool IsDefaultDouble(double? value)
      {
        return value == null || value == 0;
      }

      // First check if property exists
      var existingProperty = await _context.Properties
          .AsNoTracking() // Important - don't track this entity
          .Include(p => p.images)
          .FirstOrDefaultAsync(p => p.propertyId == propertyId && p.SellerId == userId);

      if (existingProperty == null)
      {
        return null;
      }

      // Store existing data we might need
      PropertyType newType = updateDto.PropertyType.HasValue
          ? (PropertyType)updateDto.PropertyType.Value
          : existingProperty.PropertyType;

      DateTime existingDate = existingProperty.date;

      // Store image data if needed
      List<(string Url, bool IsFirst)> existingImageData = new List<(string, bool)>();
      if (updateDto.images == null && existingProperty.images != null)
      {
        existingImageData = existingProperty.images
            .Select(img => (img.imageUrl, img.isFirst))
            .ToList();
      }

      using (var transaction = await _context.Database.BeginTransactionAsync())
      {
        try
        {
          // Step 1: Remove the entity from the context to prevent tracking issues
          _context.Entry(existingProperty).State = EntityState.Detached;

          // Step 2: Use raw SQL to delete the entity and its related images
          await _context.Database.ExecuteSqlRawAsync(
              "DELETE FROM Image WHERE propertyId = {0}", propertyId);

          await _context.Database.ExecuteSqlRawAsync(
               "DELETE FROM PropertyFacilities WHERE propertyId = {0}", propertyId);

          await _context.Database.ExecuteSqlRawAsync(
              "DELETE FROM Properties WHERE propertyId = {0}", propertyId);

          // Step 3: Create a completely new entity
          Property newProperty;

          if (newType == PropertyType.Flat)
          {
            newProperty = new Flat
            {
              propertyId = propertyId,
              SellerId = userId,
              title = IsEmptyString(updateDto.title) ? existingProperty.title : updateDto.title,
              description = IsEmptyString(updateDto.description) ? existingProperty.description : updateDto.description,
              noOfRooms = IsEmptyString(updateDto.noOfRooms) ? existingProperty.noOfRooms : updateDto.noOfRooms,
              price = IsDefaultInt(updateDto.price) ? existingProperty.price : updateDto.price.Value,
              city = IsEmptyString(updateDto.city) ? existingProperty.city : updateDto.city,
              neighborhood = IsEmptyString(updateDto.neighborhood) ? existingProperty.neighborhood : updateDto.neighborhood,
              address = IsEmptyString(updateDto.address) ? existingProperty.address : updateDto.address,
              yearBuilt = IsDefaultInt(updateDto.yearBuilt) ? existingProperty.yearBuilt : updateDto.yearBuilt.Value,
              size = IsDefaultInt(updateDto.size) ? existingProperty.size : updateDto.size.Value,
              distanceToCityCenter = IsDefaultInt(updateDto.distanceToCityCenter) ? existingProperty.distanceToCityCenter : updateDto.distanceToCityCenter.Value,
              latitude = IsDefaultDouble(updateDto.latitude) ? existingProperty.latitude : updateDto.latitude,
              longitude = IsDefaultDouble(updateDto.longitude) ? existingProperty.longitude : updateDto.longitude,
              PropertyType = PropertyType.Flat,
              date = existingDate,
              floorNo = IsDefaultInt(updateDto.floorNo)
                  ? (existingProperty is Flat flat ? flat.floorNo : 0)
                  : updateDto.floorNo.Value
            };
          }
          else
          {
            newProperty = new House
            {
              propertyId = propertyId,
              SellerId = userId,
              title = IsEmptyString(updateDto.title) ? existingProperty.title : updateDto.title,
              description = IsEmptyString(updateDto.description) ? existingProperty.description : updateDto.description,
              noOfRooms = IsEmptyString(updateDto.noOfRooms) ? existingProperty.noOfRooms : updateDto.noOfRooms,
              price = IsDefaultInt(updateDto.price) ? existingProperty.price : updateDto.price.Value,
              city = IsEmptyString(updateDto.city) ? existingProperty.city : updateDto.city,
              neighborhood = IsEmptyString(updateDto.neighborhood) ? existingProperty.neighborhood : updateDto.neighborhood,
              address = IsEmptyString(updateDto.address) ? existingProperty.address : updateDto.address,
              yearBuilt = IsDefaultInt(updateDto.yearBuilt) ? existingProperty.yearBuilt : updateDto.yearBuilt.Value,
              size = IsDefaultInt(updateDto.size) ? existingProperty.size : updateDto.size.Value,
              distanceToCityCenter = IsDefaultInt(updateDto.distanceToCityCenter) ? existingProperty.distanceToCityCenter : updateDto.distanceToCityCenter.Value,
              latitude = IsDefaultDouble(updateDto.latitude) ? existingProperty.latitude : updateDto.latitude,
              longitude = IsDefaultDouble(updateDto.longitude) ? existingProperty.longitude : updateDto.longitude,
              PropertyType = PropertyType.House,
              date = existingDate,
              noOfFloors = IsDefaultInt(updateDto.noOfFloors)
                  ? (existingProperty is House house ? house.noOfFloors : 0)
                  : updateDto.noOfFloors.Value
            };
          }

          // Step 4: Add the new entity
          _context.Properties.Add(newProperty);
          await _context.SaveChangesAsync();

          //Add facilities if provided
          if (updateDto.FacilityIds != null && updateDto.FacilityIds.Any())
          {
            foreach (var facilityId in updateDto.FacilityIds)
            {
              _context.PropertyFacilities.Add(new PropertyFacility
              {
                propertyId = propertyId,
                facilityId = facilityId
              });
            }
          }

          // Step 5: Add images
          if (updateDto.images != null)
          {
            foreach (var imgDto in updateDto.images)
            {
              _context.Set<Image>().Add(new Image
              {
                imageId = Guid.NewGuid(),
                imageUrl = imgDto.imageUrl,
                isFirst = imgDto.isFirst,
                propertyId = propertyId
              });
            }
          }
          else
          {
            // Re-create saved images
            foreach (var (url, isFirst) in existingImageData)
            {
              _context.Set<Image>().Add(new Image
              {
                imageId = Guid.NewGuid(),
                imageUrl = url,
                isFirst = isFirst,
                propertyId = propertyId
              });
            }
          }

          await _context.SaveChangesAsync();
          await transaction.CommitAsync();

          // Return the updated entity with images
          return await _context.Properties
              .Include(p => p.images)
              .Include(p => p.PropertyFacilities)
              .ThenInclude(pf => pf.Facility)
                .FirstOrDefaultAsync(p => p.propertyId == propertyId);
        }
        catch (Exception ex)
        {
          await transaction.RollbackAsync();
          Console.WriteLine($"Error details: {ex.Message}");
          if (ex.InnerException != null)
            Console.WriteLine($"Inner error: {ex.InnerException.Message}");
          throw;
        }
      }
    }








  }
}
