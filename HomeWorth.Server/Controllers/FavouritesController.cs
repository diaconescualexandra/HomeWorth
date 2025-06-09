using HomeWorth.Server.DTOs.Favourite;
using HomeWorth.Server.DTOs.Property;
using HomeWorth.Server.Interfaces;
using HomeWorth.Server.Mappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using System.Security.Claims;

namespace HomeWorth.Server.Controllers
{
  [Route("api/[controller]")]
  [ApiController]
  public class FavouritesController : ControllerBase
  {
    private readonly IFavouriteRepository _favouriteRepository;
    private readonly IPropertyRepository _propertyRepository;

    public FavouritesController(
        IFavouriteRepository favouriteRepository,
        IPropertyRepository propertyRepository)
    {
      _favouriteRepository = favouriteRepository;
      _propertyRepository = propertyRepository;
    }

    [Authorize(Roles = "Buyer")]
    [HttpGet]
    [Route("user")]
    public async Task<IActionResult> GetUserFavourites(int pageNumber, int pageSize)
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);

      // Get current user ID from claims
      var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

      var pagedResult = await _favouriteRepository.GetUserFavouritesAsync(userId, pageNumber, pageSize);

      var favouriteDtos = pagedResult.Data.ToDtoList();

      return Ok(new
      {
        Data = favouriteDtos,
        TotalCount = pagedResult.TotalCount
      });
    }

    [Authorize(Roles = "Buyer")]
    [HttpPost]
    public async Task<IActionResult> AddFavourite([FromBody] AddFavouriteRequestDto favouriteRequestDto)
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);

      var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

      // Validate property exists
      var property = await _propertyRepository.GetByIdAsync(favouriteRequestDto.propertyId);
      if (property == null)
        return NotFound("Property not found");

      await _favouriteRepository.AddFavouriteAsync(userId, favouriteRequestDto.propertyId);

      return Ok();
    }

    [Authorize(Roles = "Buyer")]
    [HttpDelete("remove-by-property/{propertyId}")]
    public async Task<IActionResult> RemoveFavouriteByProperty(Guid propertyId)
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);

      var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
      var removed = await _favouriteRepository.RemoveFavouriteAsync(userId, propertyId);
      if (!removed)
        return NotFound();
      return NoContent();
    }

  }
}
