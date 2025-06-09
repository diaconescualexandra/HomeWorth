using System.ComponentModel.DataAnnotations;

namespace HomeWorth.Server.DTOs.Offer
{
  public class BuyerInfoDto
  {
    [Required]
    public string FirstName { get; set; }
    [Required]
    public string LastName { get; set; }
    [Required]
    [EmailAddress]
    public string email { get; set; }
    [Required]
    [StringLength(10)]
    public string PhoneNumber { get; set; }
  }
}
