using HomeWorth.Server.DTOs.PropertyViews;
using HomeWorth.Server.Models;

namespace HomeWorth.Server.Mappers
{
  public static class PropertyViewMappers
  {
    public static PropertyViewDto ToDto(this PropertyView propertyView)
    {
      if (propertyView == null)
        return null;

      return new PropertyViewDto
      {
        propertyViewId = propertyView.propertyViewId,
        propertyId = propertyView.propertyId,
        viewsCount = propertyView.viewsCount
      };
    }

    public static List<PropertyViewDto> ToDtoList(this IEnumerable<PropertyView> propertyViews)
    {
      return propertyViews?.Select(pv => pv.ToDto()).ToList() ?? new List<PropertyViewDto>();
    }
  }
}
