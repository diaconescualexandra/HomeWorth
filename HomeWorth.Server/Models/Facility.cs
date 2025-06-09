namespace HomeWorth.Server.Models
{
  public class Facility
  {
    public int facilityId { get; set; }
    public string facilityName { get; set; }
    public ICollection<PropertyFacility> PropertyFacilities { get; set; } = new List<PropertyFacility>();

  }
}
