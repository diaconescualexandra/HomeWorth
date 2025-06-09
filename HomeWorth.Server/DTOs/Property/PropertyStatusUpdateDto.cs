using HomeWorth.Server.Models;
using System.ComponentModel.DataAnnotations;

namespace HomeWorth.Server.DTOs.Property
{
  public class PropertyStatusUpdateDto
  {
    [Required]
    public PropertyStatus Status { get; set; }

  }
}
