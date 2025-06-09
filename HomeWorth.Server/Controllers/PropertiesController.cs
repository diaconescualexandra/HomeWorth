using HomeWorth.Server.Data;
using HomeWorth.Server.DTOs.Property;
using HomeWorth.Server.Helpers;
using HomeWorth.Server.Interfaces;
using HomeWorth.Server.Mappers;
using HomeWorth.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HomeWorth.Server.Controllers
{
  [Route("api/[controller]")]
  [ApiController]
  public class PropertiesController : ControllerBase
  {
    private readonly IPropertyRepository _propertyRepository;

    public PropertiesController( IPropertyRepository propertyRepository)
    {
      _propertyRepository = propertyRepository;
    }

    [Authorize(Roles="Seller")]
    [HttpGet("my-properties")]
    public async Task<IActionResult> GetMyProperties([FromQuery] QueryObject query)
    {
      if (!ModelState.IsValid)
      {
        return BadRequest(ModelState);
      }

      var sellerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
      if (string.IsNullOrEmpty(sellerId))
      {
        return Unauthorized("User not found");
      }
      query.IncludeAllStatuses = true;

      var pagedResult = await _propertyRepository.GetAllPropertiesBySellerIdAsync(sellerId, query);
      var propertyDto = pagedResult.Data.Select(p => p.ToPropertyDto()).ToList();

      return Ok(new PagedResult<PropertyDto>
      {
        Data = propertyDto,
        TotalCount = pagedResult.TotalCount
      });
    }

    [Authorize(Roles = "Admin,Seller, Buyer")]
    [HttpGet]
    public async Task<IActionResult> GetAllProperties([FromQuery] QueryObject query)
    {
      if(!ModelState .IsValid)
      {
        return BadRequest(ModelState);
      }
      var pagedResult = await _propertyRepository.GetAllAsync(query);
      var propertyDto = pagedResult.Data.Select(p => p.ToPropertyDto()).ToList();

      return Ok(new PagedResult<PropertyDto>
      {
        Data = propertyDto,
        TotalCount = pagedResult.TotalCount
      });
    }

    [Authorize(Roles = "Admin,Seller, Buyer")]
    [HttpGet("{propertyId}")]
    public async Task<IActionResult> GetPropertyById(Guid propertyId)
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);

      var property = await _propertyRepository.GetByIdAsync(propertyId);
      if (property == null)
      {
        return NotFound();
      }
      return Ok(property.ToPropertyDto());
    }

    [Authorize(Roles = "Seller")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePropertyRequestDto createDto)
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);

      try
      {
        // Detailed authentication debugging
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var propertyModel = createDto.ToPropertyFromCreateDto();
        var (property, isDuplicate) = await _propertyRepository.CreateWithDuplicateCheckAsync(propertyModel, userId, createDto.FacilityIds);

        var response = property.ToPropertyDto();

        if (isDuplicate)
        {
          return Accepted(new { warning = "This title looks similar to another listing you submitted. Are you sure?", property = response });
        }

        //await _propertyRepository.CreateAsync(propertyModel, userId, createDto.FacilityIds);

        //return CreatedAtAction(nameof(GetPropertyById),
             //   new { propertyId = propertyModel.propertyId }, propertyModel.ToPropertyDto());
        return CreatedAtAction(nameof(GetPropertyById),
                new { propertyId = property.propertyId }, response);
      }
      catch (Exception ex)
      {
        Console.WriteLine($"Exception in Create: {ex.Message}");
        return StatusCode(500, $"Internal server error: {ex.Message}");
      }
    }

    [Authorize(Roles = "Seller")]
    [HttpPut]
    [Route("{propertyId}")]
    public async Task<IActionResult> Update([FromRoute] Guid propertyId, [FromBody] UpdatePropertyRequestDto updateDto)
    {

      if (!ModelState.IsValid)
        return BadRequest(ModelState);

      var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
      var propertyModel = await _propertyRepository.UpdateAsync(propertyId, updateDto, userId);
      if (propertyModel == null)
      {
        return NotFound();
      }
      return Ok(propertyModel.ToPropertyDto());
    }

    [Authorize(Roles = "Seller")]
    [HttpDelete]
    [Route("{propertyId}")]
    public async Task<IActionResult> Delete([FromRoute] Guid propertyId)
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);

      var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
      var propertyModel = await _propertyRepository.DeleteAsync(propertyId, userId);

      if (propertyModel == null)
      {
        return NotFound();
      }

      return NoContent();
    }

    [HttpPatch("{propertyId}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdatePropertyStatus(Guid propertyId, [FromBody] PropertyStatusUpdateDto statusUpdate)
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);

      try
      {
        var property = await _propertyRepository.UpdateStatusAsync(propertyId, statusUpdate.Status);
        if (property == null)
          return NotFound();

        return Ok(property.ToPropertyDto());
      }
      catch (Exception ex)
      {
        return StatusCode(500, new { message = "An error occurred while updating the property status." });
      }
    }
  }
}


