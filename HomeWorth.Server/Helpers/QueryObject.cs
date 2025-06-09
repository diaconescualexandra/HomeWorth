using HomeWorth.Server.Models;

namespace HomeWorth.Server.Helpers
{
  public class QueryObject :BaseQueryObject
  {
    // Search term
    public string? SearchTerm { get; set; } = null;

    public PropertyType? PropertyType { get; set; } = null;

    // Number of rooms filter
    public string? noOfRooms { get; set; } = null;

    // Price range filtering
    public int? MinPrice { get; set; } = null;
    public int? MaxPrice { get; set; } = null;

    // Pagination parameters
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;

    // Sorting options
    public string? SortBy { get; set; } = null;
    public bool IsDescending { get; set; } = false;

    public bool IncludeAllStatuses { get; set; }
    public bool? ExcludeGroundFloor { get; set; }
    public bool? ExcludeTopFloor { get; set; }
    public PropertyStatus? Status { get; set; }

  }

}
