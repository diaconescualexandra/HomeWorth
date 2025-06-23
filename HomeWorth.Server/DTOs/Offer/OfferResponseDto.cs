using HomeWorth.Server.Models;
using System.ComponentModel.DataAnnotations;

namespace HomeWorth.Server.DTOs.Offer
{
  public class OfferResponseDto
  {
    public int offerId { get; set; }
    public Guid propertyId { get; set; }
    public string buyerId { get; set; }
    [Required]
    public double offeredAmount { get; set; }
    [Required]
    public OfferStatus status { get; set; }
    [Required]
    public DateTime CreatedAt { get; set; }
    [Required]
    public string? firstName { get; set; }
    [Required]
    public string? lastName { get; set; }
    [Required, EmailAddress]
    public string? email { get; set; }
    [Required, StringLength(10)]
    public string? phoneNumber { get; set; }
    [Required]
    [MinLength(3)]
    [MaxLength(100)]
    public string? propertyTitle { get; set; }
  }
}
