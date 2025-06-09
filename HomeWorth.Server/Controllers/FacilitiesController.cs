using HomeWorth.Server.Data;
using HomeWorth.Server.Interfaces;
using HomeWorth.Server.Mappers;
using HomeWorth.Server.Repository;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HomeWorth.Server.Controllers
{
  [Route("api/[controller]")]
  [ApiController]
  public class FacilitiesController : ControllerBase
  {
    private readonly ApplicationDbContext _context;
    private readonly IFacilityRepository _facilityRepository;

    public FacilitiesController(ApplicationDbContext context, IFacilityRepository facilityRepository)
    {
      _context = context;
      _facilityRepository = facilityRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllFacilities()
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);

      var facilities = await _facilityRepository.GetAllAsync();
      var facilityDto = facilities.Select(p => p.ToFacilityDto());
      return Ok(facilityDto);
    }
  }
}
