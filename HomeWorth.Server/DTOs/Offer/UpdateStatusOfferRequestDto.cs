using HomeWorth.Server.Models;
using System.ComponentModel.DataAnnotations;

namespace HomeWorth.Server.DTOs.Offer
{
  public class UpdateStatusOfferRequestDto
  {
    public int offerId { get; set; }
    [Required]
    public OfferStatus status { get; set; }

  }
}
