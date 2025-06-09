using HomeWorth.Server.Interfaces;

namespace HomeWorth.Server.Repository
{
  public class ImageRepository: IImageRepository

  {
    private readonly IWebHostEnvironment _environment;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public ImageRepository(IWebHostEnvironment environment, IHttpContextAccessor httpContextAccessor)
    {
      _environment = environment;
      _httpContextAccessor = httpContextAccessor;
    }

    public async Task<string> UploadImage(IFormFile file)
    {
      if (file == null || file.Length == 0)
        throw new ArgumentException("No file uploaded");

      // Create a unique filename
      var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";

      // Determine the upload path (inside wwwroot/images)
      var uploadPath = Path.Combine(_environment.WebRootPath, "images");

      // Create directory if it doesn't exist
      if (!Directory.Exists(uploadPath))
        Directory.CreateDirectory(uploadPath);

      // Save the file
      var filePath = Path.Combine(uploadPath, fileName);
      using (var stream = new FileStream(filePath, FileMode.Create))
      {
        await file.CopyToAsync(stream);
      }

      // Return the URL to the uploaded image
      var request = _httpContextAccessor.HttpContext.Request;
      var url = $"{request.Scheme}://{request.Host}/images/{fileName}";
      return url;
    }
  }
}
