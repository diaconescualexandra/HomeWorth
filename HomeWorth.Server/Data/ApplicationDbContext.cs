using HomeWorth.Server.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Emit;

namespace HomeWorth.Server.Data
{
  public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
  {
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
: base(options)
    {

    }

    public DbSet<Property> Properties { get; set; }
    public DbSet<Flat> Flats { get; set; }
    public DbSet<House> Houses { get; set; }
    public DbSet<Facility> Facilities { get; set; }
    public DbSet<PropertyFacility> PropertyFacilities { get; set; }
    public DbSet<Offer> Offers { get; set; }
    public DbSet<Favourite> Favourites { get; set; }
    public DbSet<PropertyView> PropertyViews { get; set; }
    public DbSet<Notification> Notifications { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
      //Table per Hierarchy
      base.OnModelCreating(modelBuilder);

      modelBuilder.Entity<Property>()
          .HasDiscriminator<PropertyType>("PropertyType")
          .HasValue<Property>(0)
          .HasValue<Flat>(PropertyType.Flat)
          .HasValue<House>(PropertyType.House);

      modelBuilder.Entity<Property>()
        .HasOne(p => p.Seller)
        .WithMany(u => u.Properties)
        .HasForeignKey(p => p.SellerId)
        .OnDelete(DeleteBehavior.SetNull);

      modelBuilder.Entity<PropertyFacility>()
       .HasKey(pf => new { pf.propertyId, pf.facilityId });

      //  PropertyFacility to Property
      modelBuilder.Entity<PropertyFacility>()
          .HasOne(pf => pf.Property)
          .WithMany(p => p.PropertyFacilities)
          .HasForeignKey(pf => pf.propertyId)
          .OnDelete(DeleteBehavior.Cascade);

      //PropertyFacility to Facility
      modelBuilder.Entity<PropertyFacility>()
          .HasOne(pf => pf.Facility)
          .WithMany(f => f.PropertyFacilities)
          .HasForeignKey(pf => pf.facilityId)
          .OnDelete(DeleteBehavior.Cascade);

      modelBuilder.Entity<Facility>().HasData(
       new Facility { facilityId = 1, facilityName = "Swimming Pool" },
       new Facility { facilityId = 2, facilityName = "Gym" },
       new Facility { facilityId = 4, facilityName = "Security" },
       new Facility { facilityId = 5, facilityName = "Elevator" },
       new Facility { facilityId = 6, facilityName = "Children's Play Area" },
       new Facility { facilityId = 7, facilityName = "Garden" },
       new Facility { facilityId = 8, facilityName = "Garage" },
       new Facility { facilityId = 9, facilityName = "Balcony" },
       new Facility { facilityId = 10, facilityName = "Air Conditioning" },
       new Facility { facilityId = 11, facilityName = "Heating" },
       new Facility { facilityId = 12, facilityName = "Solar Panels" },
       new Facility { facilityId = 13, facilityName = "Outdoor Seating Area" }
   );

      modelBuilder.Entity<Offer>(entity =>
      {
        entity.Property(e => e.status)
            .HasConversion<string>()
            .HasDefaultValue(OfferStatus.IN_PROGRESS)
            .IsRequired();

        // Rest of your configurations
        entity.HasOne(o => o.Buyer)
            .WithMany(u => u.Offers)
            .HasForeignKey(o => o.buyerId)
            .OnDelete(DeleteBehavior.Restrict);

        entity.HasOne(o => o.Property)
            .WithMany(p => p.Offers)
            .HasForeignKey(o => o.propertyId)
            .OnDelete(DeleteBehavior.Restrict);
      });

      modelBuilder.Entity<Favourite>()
        .HasKey(f => f.favouriteId);

      modelBuilder.Entity<Favourite>()
          .HasOne(f => f.Buyer)
          .WithMany(u => u.Favourites)
          .HasForeignKey(f => f.buyerId)
          .OnDelete(DeleteBehavior.Restrict);

      modelBuilder.Entity<Favourite>()
          .HasOne(f => f.Property)
          .WithMany(p => p.Favourites)
          .HasForeignKey(f => f.propertyId)
          .OnDelete(DeleteBehavior.Restrict);

      modelBuilder.Entity<PropertyView>()
    .HasKey(pv => pv.propertyViewId);

      modelBuilder.Entity<PropertyView>()
          .HasOne(pv => pv.Buyer)
          .WithMany(u => u.PropertyViews)  
          .HasForeignKey(pv => pv.buyerId)
          .OnDelete(DeleteBehavior.Restrict);

      modelBuilder.Entity<PropertyView>()
          .HasOne(pv => pv.Property)
          .WithMany(p => p.PropertyViews)  
          .HasForeignKey(pv => pv.propertyId)
          .OnDelete(DeleteBehavior.Restrict);

      modelBuilder.Entity<Notification>(entity =>
      {
        entity.HasKey(n => n.NotificationId);

        entity.HasOne<ApplicationUser>()
            .WithMany()
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);
      });
    }
  }
}
