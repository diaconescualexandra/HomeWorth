using HomeWorth.Server.Models;
using Microsoft.AspNetCore.Identity;
using System.Data;
using System.Security.Claims;

namespace HomeWorth.Server.Interfaces
{
  public interface ITokenService
  {
    string CreateToken(ApplicationUser applicationUser);

  }
}
