using Microsoft.AspNetCore.Identity;

namespace HomeWorth.Server.Models
{
  public class ApplicationUser : IdentityUser
  {
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public ICollection<Property> Properties { get; set; } = new List<Property>();
    public ICollection<Offer> Offers { get; set; }
    public ICollection<Favourite> Favourites { get; set; } = new List<Favourite>();
    public virtual ICollection<PropertyView> PropertyViews { get; set; }

  }
}
