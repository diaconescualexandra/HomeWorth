namespace HomeWorth.Server.Helpers
{
  public class PagedResult<T>

  {
    public List<T> Data { get; set; }
    public int TotalCount { get; set; }
  }
}
