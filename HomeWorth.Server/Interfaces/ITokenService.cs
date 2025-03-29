using HomeWorth.Server.Models;

namespace HomeWorth.Server.Interfaces
{
  public interface ITokenService
  {
    string CreateToken(ApplicationUser applicationUser);
  }
}
