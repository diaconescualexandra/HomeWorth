using System.ComponentModel.DataAnnotations;

namespace HomeWorth.Server.DTOs.Property
{
  public class ImageRequestDto
  {
    [Required]
    public string imageUrl { get; set; }
    [Required]
    public bool isFirst { get; set; }
  }
}
