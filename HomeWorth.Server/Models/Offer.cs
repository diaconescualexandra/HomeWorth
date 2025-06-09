namespace HomeWorth.Server.Models
{
  public enum OfferStatus
  {
    IN_PROGRESS = 0,
    ACCEPTED = 1,
    DECLINED = 2,
    VIEWED = 3,
    EXPIRED = 4,
  }
  public class Offer
  {
    public int offerId { get; set; }
    public Guid propertyId { get; set; }
    public string buyerId { get; set; }
    public double offeredAmount { get; set; }
    public OfferStatus status { get; set; } = OfferStatus.IN_PROGRESS;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Property Property { get; set; }
    public ApplicationUser Buyer { get; set; }
  }
}
