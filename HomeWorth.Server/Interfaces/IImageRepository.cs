namespace HomeWorth.Server.Interfaces
{
  public interface IImageRepository
  {
    Task<string> UploadImage(IFormFile file);
  }
}
