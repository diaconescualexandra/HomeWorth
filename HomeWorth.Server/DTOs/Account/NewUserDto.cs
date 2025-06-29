using System.ComponentModel.DataAnnotations;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HomeWorth.Server.DTOs.Account
{
  public class NewUserDto
  {
    public string UserName { get; set; }
    public string Email { get; set; }
    public string Token { get; set; }
    public string PhoneNumber { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
  }
}
