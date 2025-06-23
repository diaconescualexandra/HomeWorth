using HomeWorth.Server.DTOs.Account;
using HomeWorth.Server.Interfaces;
using HomeWorth.Server.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Rewrite;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Web;

namespace HomeWorth.Server.Controllers
{
  [Route("api/account")]
  [ApiController]
  public class AccountsController : ControllerBase
  {

    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ITokenService _tokenService;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly IEmailSender _emailSender;
    public AccountsController(UserManager<ApplicationUser> userManager, ITokenService tokenService, SignInManager<ApplicationUser> signInManager, IEmailSender emailSender)
    {
      _userManager = userManager;
      _tokenService = tokenService;
      _signInManager = signInManager;
      _emailSender = emailSender;
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
          UserName = registerDto.Name.ToLower(),
          Email = registerDto.Email.ToLower(),
          PhoneNumber = registerDto.PhoneNumber,
          FirstName = registerDto.FirstName,
          LastName = registerDto.LastName
        };

        var createUser = await _userManager.CreateAsync(applicationUser, registerDto.Password);

        if (createUser.Succeeded)
        {
          var token = await _userManager.GenerateEmailConfirmationTokenAsync(applicationUser);
          var confirmationLink = $"http://localhost:4200/confirm-email?userId={applicationUser.Id}&token={HttpUtility.UrlEncode(token)}";

          await _emailSender.SendEmailAsync(
              applicationUser.Email,
              "Confirm your email",
              $"Please confirm your email by clicking this link: <a href='{confirmationLink}'>link</a>");

          if (registerDto.Role == "Buyer" || registerDto.Role == "Seller")
          {
            var roleResult = await _userManager.AddToRoleAsync(applicationUser, registerDto.Role);
            if (!roleResult.Succeeded)
              return StatusCode(500, roleResult.Errors);
          }
          else
          {
            return BadRequest("Invalid role");
          }

          return Ok(new
          {
            message = "Registration successful. Please confirm your email.",
            confirmationLink, // Remove in production.
            user = new NewUserDto
            {
              UserName = applicationUser.UserName,
              Email = applicationUser.Email,
              PhoneNumber = applicationUser.PhoneNumber,
              Token = _tokenService.CreateToken(applicationUser)
            }
          });
        }
        else
        {
          return StatusCode(500, new { error = "user creation error" });
        }
      }
      catch (Exception ex)
      {
        return StatusCode(500, new { error = "Unexpected error during registration" });
      }
    }


    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto loginDto)
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);

      var applicationUser = await _userManager.Users.FirstOrDefaultAsync(x => x.UserName == loginDto.Name.ToLower());

      if (applicationUser == null) return BadRequest("Invalid username!");

      var result = await _signInManager.CheckPasswordSignInAsync(applicationUser, loginDto.Password, false);

      if (!result.Succeeded) return Unauthorized(new { message = "Invalid password" });

      return Ok(
        new NewUserDto
        {
          UserName = applicationUser.UserName,
          Email = applicationUser.Email,
          PhoneNumber = applicationUser.PhoneNumber,
          FirstName = applicationUser.FirstName,
          LastName = applicationUser.LastName,
          Token = _tokenService.CreateToken(applicationUser)
        });
    }

    [HttpPost("confirm-email")]
    public async Task<IActionResult> ConfirmEmail(ConfirmEmailDto model)
    {
      var user = await _userManager.FindByIdAsync(model.UserId);
      if (user == null)
        return BadRequest("Invalid user");

      var result = await _userManager.ConfirmEmailAsync(user, model.Token);
      return result.Succeeded ? Ok("Email confirmed") : BadRequest("Invalid token");
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto model)
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);

      var user = await _userManager.FindByEmailAsync(model.Email);
      if (user == null || !(await _userManager.IsEmailConfirmedAsync(user)))
      {
        return NoContent(); 
      }

      var token = await _userManager.GeneratePasswordResetTokenAsync(user);
      var callbackUrl = $"http://localhost:4200/reset-password?email={user.Email}&token={HttpUtility.UrlEncode(token)}";

      await _emailSender.SendEmailAsync(user.Email, "Reset Password",
          $"Please reset your password by clicking here: <a href='{callbackUrl}'>link</a>");

      return NoContent();
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(ResetPasswordDto model)
    {
      var user = await _userManager.FindByEmailAsync(model.Email);
      if (user == null)
        return BadRequest("Invalid request");

      var result = await _userManager.ResetPasswordAsync(user, model.Token, model.NewPassword);
      return result.Succeeded ? Ok("Password reset successful") : BadRequest("Error resetting password");
    }

    [HttpGet("externallogin")]
    public async Task<IActionResult> ExternalLogin(string returnUrl = "/")
    {
      var info = await _signInManager.GetExternalLoginInfoAsync();
      if (info == null)
        return Redirect("/login-failed");

      var result = await _signInManager.ExternalLoginSignInAsync(info.LoginProvider, info.ProviderKey, false);
      if (!result.Succeeded)
      {
        var user = new ApplicationUser
        {
          UserName = info.Principal.FindFirstValue(ClaimTypes.Email),
          Email = info.Principal.FindFirstValue(ClaimTypes.Email),
          EmailConfirmed = true
        };

        await _userManager.CreateAsync(user);
        await _userManager.AddLoginAsync(user, info);
      }

      var appUser = await _userManager.FindByLoginAsync(info.LoginProvider, info.ProviderKey);
      var token = _tokenService.CreateToken(appUser); // issue your JWT

      return Ok(new { token });
    }

  }
}
