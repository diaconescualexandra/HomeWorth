using HomeWorth.Server.DTOs.Property;
using System.ComponentModel.DataAnnotations;

namespace HomeWorth.Server.DTOs.Favourite
{
  public class FavouriteDto
  {
    public int favouriteId { get; set; }
    public Guid propertyId { get; set; }
    [Required]
    [MinLength(3)]
    [MaxLength(100)]
    public string title { get; set; }
    [Required]
    [MaxLength(500)]
    [MinLength(10)]
    public string description { get; set; }
    [Required]
    [Range(1, 30000000)]
    public int price { get; set; }
    [Required]
    public string city { get; set; }
    [Required]
    public string neighborhood { get; set; }
    [Required]
    public List<ImageResponseDto> images { get; set; }

  }
}
