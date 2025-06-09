namespace HomeWorth.Server.Models
{
  public class PropertyFacility
  {
    public Guid propertyId { get; set; }
    public Property Property { get; set; }

    public int facilityId { get; set; }
    public Facility Facility { get; set; }
  }
}
