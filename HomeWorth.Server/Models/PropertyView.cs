namespace HomeWorth.Server.Models
{
  public class PropertyView
  {
    public int propertyViewId { get; set; }
    public string buyerId { get; set; }
    public Guid propertyId { get; set; }
    public DateTime viewedAt { get; set; }
    public int viewsCount { get; set; }

    public ApplicationUser Buyer { get; set; }
    public Property Property { get; set; }
  }
}
