using HomeWorth.Server.Models;
using System.ComponentModel.DataAnnotations;

namespace HomeWorth.Server.DTOs.Property
{
  public class UpdatePropertyRequestDto
  {
    [Required]
    [MinLength(3)]
    [MaxLength(100)]
    public string? title { get; set; }
    [Required]
    [MaxLength(500)]
    [MinLength(10)]
    public string? description { get; set; }
    [Required]
    [Range(1, 15)]
    public string? noOfRooms { get; set; }
    [Required]
    public int? distanceToCityCenter { get; set; }
    [Required]
    [Range(1, 30000000)]
    public int? price { get; set; }
    [Required]
    public string? city { get; set; }
    [Required]
    public string? neighborhood { get; set; }
    [Required]
    public string? address { get; set; }
    [Required]
    public int? yearBuilt { get; set; }
    [Required]
    [Range(1, 5000)]

    public int? size { get; set; }
    public double? latitude { get; set; }
    public double? longitude { get; set; }
    [Required]
    public int? PropertyType { get; set; }
   
    public int? noOfFloors { get; set; }
   
    public int? floorNo { get; set; }
    
    public int? totalFloors { get; set; }
    [Required]
    public List<ImageRequestDto>? images { get; set; }
    public string? SellerId { get; set; }
   
    public string? sellerFirstName { get; set; }
    public List<int>? FacilityIds { get; set; }
    [Required]
    public PropertyStatus Status { get; set; }
  }
}
