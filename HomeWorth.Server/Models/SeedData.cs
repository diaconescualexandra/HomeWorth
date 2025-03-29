using HomeWorth.Server.Data;
using Microsoft.AspNetCore.Components.Forms;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace HomeWorth.Server.Models
{
  public static class SeedData
  {
    public static void Initialize(IServiceProvider serviceProvider)
    {
      using (var context = new ApplicationDbContext(
      serviceProvider.GetRequiredService
      <DbContextOptions<ApplicationDbContext>>()))
      {
        
        if (context.Roles.Any())
        {
          return; // db already has roles
        }
        // CREATE DB ROLES
      context.Roles.AddRange(

            new IdentityRole
            {Id = "562cb58b-85e3-4eb1-b125-93b81370016d", Name = "Admin", NormalizedName = "Admin".ToUpper() },
        
            new IdentityRole
            {Id = "562cb58b-85e3-4eb1-b125-93b81370016e", Name = "Seller", NormalizedName = "Seller".ToUpper() },
        
            new IdentityRole
            {Id = "562cb58b-85e3-4eb1-b125-93b81370016f", Name = "Buyer", NormalizedName = "Buyer".ToUpper() },

             new IdentityRole
            {Id = "562cb58b-85e3-4eb1-b125-93b81370016a", Name = "Guest", NormalizedName = "Guest".ToUpper() }

           
        );
        //to create passwords
        var hasher = new PasswordHasher<ApplicationUser>();


        // CREATE USERS IN DB; One user per role
        context.Users.AddRange(

          new ApplicationUser
          {
            Id = "be1f08fa-3e30-4bba-b1af-d53b487c4eeb",
            UserName = "admin@test.com",
            EmailConfirmed = true,
            NormalizedEmail = "ADMIN@TEST.COM",
            Email = "admin@test.com",
            NormalizedUserName = "ADMIN@TEST.COM",
            PasswordHash = hasher.HashPassword(null, "Admin1!")
          },

          new ApplicationUser
          {
            Id = "be1f08fa-3e30-4bba-b1af-d53b487c4eec",
            UserName = "seller@test.com",
            EmailConfirmed = true,
            NormalizedEmail = "SELLER@TEST.COM",
            Email = "seller@test.com",
            NormalizedUserName = "SELLER@TEST.COM",
            PasswordHash = hasher.HashPassword(null, "Seller1!")
          },

          new ApplicationUser
          {
            Id = "be1f08fa-3e30-4bba-b1af-d53b487c4eed",
            UserName = "buyer@test.com",
            EmailConfirmed = true,
            NormalizedEmail = "BUYER@TEST.COM",
            Email = "buyer@test.com",
            NormalizedUserName = "BUYER@TEST.COM",
            PasswordHash = hasher.HashPassword(null, "Buyer1!")
          },

          new ApplicationUser
          {
            Id = "be1f08fa-3e30-4bba-b1af-d53b487c4eee",
            UserName = "guest@test.com",
            EmailConfirmed = true,
            NormalizedEmail = "GUEST@TEST.COM",
            Email = "guest@test.com",
            NormalizedUserName = "GUEST@TEST.COM",
            PasswordHash = hasher.HashPassword(null, "Guest1!")
          }
      );

       //ASSOCIATE USER-ROLE
        context.UserRoles.AddRange(

          //admin
          new IdentityUserRole<string> 
          {
            RoleId = "562cb58b-85e3-4eb1-b125-93b81370016d",
            UserId = "be1f08fa-3e30-4bba-b1af-d53b487c4eeb"
          },

          //seller
          new IdentityUserRole<string> 
          {
            RoleId = "562cb58b-85e3-4eb1-b125-93b81370016e",
            UserId = "be1f08fa-3e30-4bba-b1af-d53b487c4eec"
          },

          //buyer
          new IdentityUserRole<string>
          {
            RoleId = "562cb58b-85e3-4eb1-b125-93b81370016f", 
            UserId = "be1f08fa-3e30-4bba-b1af-d53b487c4eed"
          },

          //guest
          new IdentityUserRole<string>
          {
            RoleId = "562cb58b-85e3-4eb1-b125-93b81370016a",
            UserId = "be1f08fa-3e30-4bba-b1af-d53b487c4eee"
          }
        );

        context.SaveChanges();
      }
    }
  }
}
