namespace HomeWorth.Server.Models
{
  public class Favourite
  {
    public int favouriteId { get; set; }
    public string buyerId { get; set; }
    public Guid propertyId { get; set; }
    public ApplicationUser Buyer { get; set; }
    public Property Property { get; set; }
  }
}
