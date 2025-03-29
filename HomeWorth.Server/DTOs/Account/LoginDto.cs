using System.ComponentModel.DataAnnotations;

namespace HomeWorth.Server.DTOs.Account
{
  public class LoginDto
  {
    [Required]
    public string Name { get; set; }

    [Required]
    public string Password {  get; set; }
  }
}
