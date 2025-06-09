using HomeWorth.Server.Interfaces;
using HomeWorth.Server.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Identity;

namespace HomeWorth.Server.Service
{
  public class TokenService : ITokenService
  {
    private readonly IConfiguration _config;
    private readonly SymmetricSecurityKey _key;
    private readonly UserManager<ApplicationUser> _userManager;

    public TokenService(IConfiguration config, UserManager<ApplicationUser> userManager)
    {
      _config = config;
      _userManager = userManager;
      _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["JWT:SigningKey"]));
    }
    public string CreateToken(ApplicationUser applicationUser)
    {
      var claims = new List<Claim>
      {
        new Claim(JwtRegisteredClaimNames.Email, applicationUser.Email),
        new Claim(JwtRegisteredClaimNames.GivenName, applicationUser.UserName),
        new Claim(ClaimTypes.NameIdentifier, applicationUser.Id)

      };

      var roles = _userManager.GetRolesAsync(applicationUser).Result;
      foreach (var role in roles)
      {
        claims.Add(new Claim(ClaimTypes.Role, role));
      }

      var credentials = new SigningCredentials(_key, SecurityAlgorithms.HmacSha512Signature);

      var tokenDescriptor = new SecurityTokenDescriptor
      {
        Subject = new ClaimsIdentity(claims),
        Expires = DateTime.Now.AddDays(7),
        SigningCredentials = credentials,
        Issuer = _config["JWT:Issuer"],
        Audience = _config["JWT:Audience"]
      };
      var tokenHandler = new JwtSecurityTokenHandler();

      var token = tokenHandler.CreateToken(tokenDescriptor);

      return tokenHandler.WriteToken(token);

    }
  }
}
