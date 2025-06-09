namespace HomeWorth.Server.Models
{
  public enum PropertyType
  {
    Flat = 1,
    House = 2
  }

  public enum PropertyStatus
  {
    Pending = 0,
    Accepted = 1,
    Rejected = 2
  }
  public class Property
  {
    public Guid propertyId { get; set; }
    public string title { get; set; }
    public string description { get; set; }
    public string noOfRooms { get; set; }
    public int price { get; set; }
    public int distanceToCityCenter { get; set; }
    public string city { get; set; }
    public string neighborhood { get; set; }
    public string address { get; set; }
    public int yearBuilt { get; set; }
    public int size { get; set; }
    public DateTime date { get; set; }
    public double? latitude { get; set; }
    public double? longitude { get; set; }
    public List<Image> images { get;set;}
    public PropertyType PropertyType { get; set; }
    public string? SellerId { get; set; }
    public string? sellerFirstName { get; set; }
    public PropertyStatus Status { get; set; } = PropertyStatus.Accepted; 
    public ApplicationUser? Seller { get; set; }
    public ICollection<PropertyFacility> PropertyFacilities { get; set; } = new List<PropertyFacility>();
    public virtual ICollection<Offer> Offers { get; set; } = new List<Offer>();
    public ICollection<Favourite> Favourites { get; set; }
    public virtual ICollection<PropertyView> PropertyViews { get; set; }

  }
}
