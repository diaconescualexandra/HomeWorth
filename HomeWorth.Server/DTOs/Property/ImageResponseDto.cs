using System.ComponentModel.DataAnnotations;

namespace HomeWorth.Server.DTOs.Property
{
  public class ImageResponseDto
  {
    [Required]
    public string imageUrl { get; set; }
    [Required]
    public bool isFirst { get; set; }
    public Guid imageId { get; set; }

  }
}
