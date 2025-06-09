using System.ComponentModel.DataAnnotations;

namespace HomeWorth.Server.DTOs.Account
{
  public class RegisterDto
  {
    [Required]
    public string Name { get; set; }
    [Required]
    [EmailAddress]
    public string Email {  get; set; }
    [Required]
    public string Password { get; set; }
    [Required]
    public string Role {  get; set; }
    [Required]
    public string PhoneNumber { get; set; }
    [Required]
    public string FirstName { get; set; }
    [Required]
    public string LastName { get; set; }
  }
}
