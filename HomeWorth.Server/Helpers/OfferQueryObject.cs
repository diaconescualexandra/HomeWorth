using HomeWorth.Server.Models;

namespace HomeWorth.Server.Helpers
{
  public class OfferQueryObject : BaseQueryObject
  {
    public Guid? PropertyId { get; set; }
    public string? BuyerId { get; set; }
    public OfferStatus? Status { get; set; }
  }
}
