using HomeWorth.Server.Data;
using HomeWorth.Server.Interfaces;
using HomeWorth.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace HomeWorth.Server.Repository
{
  public class FacilityRepository : IFacilityRepository
  {
    public readonly ApplicationDbContext _context;
    public FacilityRepository(ApplicationDbContext context)
    {
      _context = context;
    }
    public async Task<List<Facility>> GetAllAsync()
    {
     return await _context.Facilities.ToListAsync();
    }
  }
}
