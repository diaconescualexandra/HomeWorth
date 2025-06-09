using HomeWorth.Server.Interfaces;
using HomeWorth.Server.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HomeWorth.Server.Controllers
{
  [Route("api/[controller]")]
  [ApiController]
  public class ImagesController : ControllerBase
  {
    private readonly IImageRepository _imageRepository;

    public ImagesController(IImageRepository imageRepository)
    {
      _imageRepository = imageRepository;
    }

    [HttpPost]
    [Authorize(Roles = "Seller")]
    public async Task<IActionResult> Upload(IFormFile image)
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);
      try
      {
        var imageUrl = await _imageRepository.UploadImage(image);
        return Ok(new { imageUrl });
      }
      catch (ArgumentException ex)
      {
        return BadRequest(ex.Message);
      }
      catch (Exception ex)
      {
        return StatusCode(500, $"Internal server error: {ex.Message}");
      }

    }
  }
}
