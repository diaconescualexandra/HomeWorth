using HomeWorth.Server.DTOs.PropertyViews;
using HomeWorth.Server.Interfaces;
using HomeWorth.Server.Mappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HomeWorth.Server.Controllers
{
  [Route("api/[controller]")]
  [ApiController]
  public class PropertyViewsController : ControllerBase
  {
    private readonly IPropertyViewRepository _propertyViewRepository;
    private readonly IPropertyRepository _propertyRepository;

    public PropertyViewsController(
        IPropertyViewRepository propertyViewRepository,
        IPropertyRepository propertyRepository)
    {
      _propertyViewRepository = propertyViewRepository;
      _propertyRepository = propertyRepository;
    }

    
    [HttpGet("count")]
    public async Task<IActionResult> GetPropertyViewCounts([FromQuery] string ids)
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);

      if (string.IsNullOrWhiteSpace(ids))
        return BadRequest("No property IDs provided.");

      var idList = ids.Split(',').Select(id => Guid.TryParse(id, out var guid) ? guid : Guid.Empty)
          .Where(guid => guid != Guid.Empty)
          .ToList();

      var counts = await _propertyViewRepository.GetPropertyViewCountsAsync(idList);

      // Return as a dictionary: { propertyId: count }
      return Ok(counts);
    }

    [Authorize(Roles = "Buyer")]
    [HttpPost("add")]
    public async Task<IActionResult> AddPropertyView([FromBody] AddPropertyViewRequestDto requestDto)
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);
      

      var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

      var property = await _propertyRepository.GetByIdAsync(requestDto.propertyId);
      if (property == null)
        return NotFound("Property not found");

      await _propertyViewRepository.AddOrUpdatePropertyViewAsync(userId, requestDto.propertyId);
      return Ok();
    }

    [Authorize(Roles = "Admin,Seller,Buyer")]
    [HttpGet("most-viewed/{count}")]
    public async Task<IActionResult> GetMostViewedProperties(int count = 5)
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);

      var propertyDtos = await _propertyViewRepository.GetMostViewedPropertiesAsync(count);

      return Ok(propertyDtos);
    }

  }
}
