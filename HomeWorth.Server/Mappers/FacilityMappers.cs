using HomeWorth.Server.DTOs.Property;
using HomeWorth.Server.Models;
namespace HomeWorth.Server.Mappers
{
  public static class FacilityMappers
  {
    public static FacilityDto ToFacilityDto(this Facility facilityModel)
    {
      var facilityDto = new FacilityDto
      {
        facility_id = facilityModel.facilityId,
        facilityName = facilityModel.facilityName
        
      };
      return facilityDto;
    }

  }
}
