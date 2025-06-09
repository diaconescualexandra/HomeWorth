using HomeWorth.Server.Models;
using System.ComponentModel.DataAnnotations;

namespace HomeWorth.Server.DTOs.Offer
{
  public class OfferRequestDto
  {
    public Guid propertyId { get; set; }
    [Required]
    [MaxLength(20)]
    public double offeredAmount { get; set; }
  }
}
