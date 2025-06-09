using HomeWorth.Server.Models;

namespace HomeWorth.Server.Interfaces
{
  public interface IFacilityRepository
  {
    Task<List<Facility>> GetAllAsync();
  }
}
