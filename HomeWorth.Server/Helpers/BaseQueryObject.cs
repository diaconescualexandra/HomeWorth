namespace HomeWorth.Server.Helpers
{
  public class BaseQueryObject
  {
    private int pageSize = 10;
    private int pageNumber = 1;

    public int PageSize
    {
      get => pageSize;
      set => pageSize = value > 0 ? value : 10;
    }

    public int PageNumber
    {
      get => pageNumber;
      set => pageNumber = value > 0 ? value : 1;
    }

    public string? SortBy { get; set; }
    public bool IsDescending { get; set; }
  }
}
