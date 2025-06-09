using System.ComponentModel.DataAnnotations;

namespace HomeWorth.Server.DTOs.PropertyViews
{
  public class PropertyViewDto
  {
    public int propertyViewId { get; set; }
    public Guid propertyId { get; set; }
    [Required]
    public int viewsCount { get; set; }
  }
}
