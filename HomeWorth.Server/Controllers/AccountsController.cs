using HomeWorth.Server.DTOs.Account;
using HomeWorth.Server.Interfaces;
using HomeWorth.Server.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Rewrite;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.EntityFrameworkCore;

namespace HomeWorth.Server.Controllers
{
  [Route("api/account")]
  [ApiController]
  public class AccountsController : ControllerBase
  {

    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ITokenService _tokenService;
    private readonly SignInManager<ApplicationUser> _signInManager;
    public AccountsController(UserManager<ApplicationUser> userManager, ITokenService tokenService, SignInManager<ApplicationUser> signInManager)
    {
      _userManager = userManager;
      _tokenService = tokenService;
      _signInManager = signInManager;

    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
    {

      try
      {

        if (!ModelState.IsValid)
          return BadRequest(ModelState);

        var applicationUser = new ApplicationUser
        {
          UserName = registerDto.Name,
          Email = registerDto.Email
        };

        var createUser = await _userManager.CreateAsync(applicationUser, registerDto.Password);

        if (createUser.Succeeded)
        {
          IdentityResult roleResult = IdentityResult.Success;
          if (registerDto.Role == "Buyer" || registerDto.Role == "Seller")
          {
            roleResult = await _userManager.AddToRoleAsync(applicationUser, registerDto.Role);
            if (!roleResult.Succeeded)
            {
              return StatusCode(500, roleResult.Errors);
            }
            else return Ok(
              new NewUserDto
              {
                UserName = applicationUser.UserName,
                Email = applicationUser.Email,
                Token = _tokenService.CreateToken(applicationUser)
              });

          }
          else { return BadRequest("Invalid role"); }
        }
        else
        {
          return StatusCode(500, new { error = "user creation error" });
        }

      }
      catch (Exception ex)
      {
        return StatusCode(500, new { error = "other error for user creation" });
      }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto loginDto)
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);

      var applicationUser = await _userManager.Users.FirstOrDefaultAsync(x => x.UserName == loginDto.Name.ToLower());

      if (applicationUser == null) return Unauthorized("Invalid username!");

      var result = await _signInManager.CheckPasswordSignInAsync(applicationUser, loginDto.Password, false);

      if (!result.Succeeded) return Unauthorized("Username not found");

      return Ok(
        new NewUserDto
        {
          UserName = applicationUser.UserName,
          Email = applicationUser.Email,
          Token = _tokenService.CreateToken(applicationUser)
        });
    }
  }
}
