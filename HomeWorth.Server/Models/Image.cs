namespace HomeWorth.Server.Models
{
  public class Image
  {
    public Guid imageId {  get; set; }
    public Guid propertyId { get; set; }
    public string imageUrl { get; set; }
    public bool isFirst { get; set; }
    public Property Property { get; set; }
  }
}
