using HomeWorth.Server.DTOs.Offer;
using HomeWorth.Server.DTOs.Property;
using HomeWorth.Server.DTOs.PropertyViews;
using HomeWorth.Server.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace HomeWorth.Server.Mappers
{
  public static class PropertyMappers
  {
    public static PropertyDto ToPropertyDto(this Property propertyModel)
    {
      var propertyDto = new PropertyDto
      {
        propertyId = propertyModel.propertyId,
        SellerId = propertyModel.SellerId,
        title = propertyModel.title,
        description = propertyModel.description,
        noOfRooms = propertyModel.noOfRooms,
        price = propertyModel.price,
        city = propertyModel.city,
        neighborhood = propertyModel.neighborhood,
        address = propertyModel.address,
        yearBuilt = propertyModel.yearBuilt,
        size = propertyModel.size,
        latitude = propertyModel.latitude,
        longitude = propertyModel.longitude,
        PropertyType = (int)propertyModel.PropertyType,
        Status = (int)propertyModel.Status,
        distanceToCityCenter = propertyModel.distanceToCityCenter,
        sellerFirstName = propertyModel.Seller?.FirstName,

        Facilities = propertyModel.PropertyFacilities?
        .Select(pf => new FacilityDto
        {
          facility_id = pf.facilityId,
          facilityName = pf.Facility?.facilityName
        })
        .ToList() ?? new List<FacilityDto>(),

        images = propertyModel.images?
        .Select(image => new ImageResponseDto
        {
          imageId = image.imageId,
          imageUrl = image.imageUrl,
          isFirst = image.isFirst
        }).ToList() ?? new List<ImageResponseDto>(),

        PropertyViews = propertyModel.PropertyViews != null && propertyModel.PropertyViews.Any()
            ? new PropertyViewDto
            {
              propertyViewId = propertyModel.PropertyViews.FirstOrDefault()?.propertyViewId ?? 0,
              propertyId = propertyModel.propertyId,
              viewsCount = propertyModel.PropertyViews.Count
            }
            : null,

        Offers = propertyModel.Offers?
            .Select(o => new OfferResponseDto
            {
              offerId = o.offerId,
              propertyId = o.propertyId,
              buyerId = o.buyerId,
              offeredAmount = o.offeredAmount,
              status = o.status,
              CreatedAt = o.CreatedAt
            })
            .ToList() ?? new List<OfferResponseDto>()

      };



      if (propertyModel is Flat flat)
      {
        propertyDto.floorNo = flat.floorNo;
        propertyDto.totalFloors = flat.totalFloors;

      }
      else if (propertyModel is House house)
      {
        propertyDto.noOfFloors = house.noOfFloors;
      }

      return propertyDto;
    }

    public static Property ToPropertyFromCreateDto(this CreatePropertyRequestDto createDto)
    {
      // Create the appropriate property type based on the discriminator
      Property newProperty;

      if (createDto.PropertyType == (int)PropertyType.Flat)
      {
        newProperty = new Flat
        {
          propertyId = Guid.NewGuid(),
          SellerId = createDto.SellerId,
          title = createDto.title,
          description = createDto.description,
          noOfRooms = createDto.noOfRooms,
          price = createDto.price,
          city = createDto.city,
          neighborhood = createDto.neighborhood,
          address = createDto.address,
          yearBuilt = createDto.yearBuilt,
          size = createDto.size,
          latitude = createDto.latitude,
          longitude = createDto.longitude,
          distanceToCityCenter = createDto.distanceToCityCenter,
          PropertyType = PropertyType.Flat,
          date = DateTime.UtcNow,
          floorNo = createDto.floorNo.HasValue ? createDto.floorNo.Value : 0,
          totalFloors = createDto.totalFloors.HasValue ? createDto.totalFloors.Value : 0

        };
      }
      else
      {
        newProperty = new House
        {
          propertyId = Guid.NewGuid(),
          SellerId = createDto.SellerId,
          title = createDto.title,
          description = createDto.description,
          noOfRooms = createDto.noOfRooms,
          price = createDto.price,
          city = createDto.city,
          neighborhood = createDto.neighborhood,
          address = createDto.address,
          yearBuilt = createDto.yearBuilt,
          size = createDto.size,
          latitude = createDto.latitude,
          distanceToCityCenter = createDto.distanceToCityCenter,
          longitude = createDto.longitude,
          PropertyType = PropertyType.House,
          date = DateTime.UtcNow,
          noOfFloors = createDto.noOfFloors.HasValue ? createDto.noOfFloors.Value : 0
        };
      }

      if (createDto.images != null)
      {
        newProperty.images = createDto.images.Select(img => new Image
        {
          imageId = Guid.NewGuid(),
          imageUrl = img.imageUrl,
          isFirst = img.isFirst,
          propertyId = newProperty.propertyId,
          Property = newProperty
        }).ToList();
      }
      else
      {
        newProperty.images = new List<Image>();
      }

      return newProperty;
    }

  }
}
