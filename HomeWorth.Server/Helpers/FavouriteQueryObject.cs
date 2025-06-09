using HomeWorth.Server.Models;

namespace HomeWorth.Server.Helpers
{
  public class FavouriteQueryObject : BaseQueryObject
  {
    public string? UserId { get; set; }
    public PropertyType? PropertyType { get; set; }
  }
}
