using HomeWorth.Server.Data;
using HomeWorth.Server.Interfaces;
using HomeWorth.Server.Models;
using HomeWorth.Server.Service;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using HomeWorth.Server.Repository;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));
builder.Services.AddDatabaseDeveloperPageExceptionFilter();

builder.Services.AddDefaultIdentity<ApplicationUser>(options =>
  { //options.SignIn.RequireConfirmedAccount = true;
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    //options.Password.RequiredLength = 10;

  })
  .AddRoles<IdentityRole>()
  .AddEntityFrameworkStores<ApplicationDbContext>();

builder.Services.AddAuthentication(options =>
{
  options.DefaultAuthenticateScheme =
  options.DefaultForbidScheme =
  options.DefaultChallengeScheme =
  options.DefaultScheme =
  options.DefaultSignInScheme =
  options.DefaultSignOutScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
  options.TokenValidationParameters = new TokenValidationParameters
  {
    ValidateIssuer = true,
    ValidIssuer = builder.Configuration["JWT:Issuer"],
    ValidateAudience = true,
    ValidAudience = builder.Configuration["JWT:Audience"],
    ValidateIssuerSigningKey = true,
    IssuerSigningKey = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(builder.Configuration["JWT:SigningKey"]))
  };

  options.Events = new JwtBearerEvents
  {
    OnMessageReceived = context =>
    {
      var accessToken = context.Request.Query["access_token"];
      var path = context.HttpContext.Request.Path;
      if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs/offers"))
      {
        context.Token = accessToken;
      }
      return Task.CompletedTask;
    }
  };
});


builder.Services.AddControllersWithViews();

//swagger
builder.Services.AddControllers()
  .AddNewtonsoftJson();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

//jwt in swagger
builder.Services.AddSwaggerGen(option =>
{
  option.SwaggerDoc("v1", new OpenApiInfo { Title = "HomeWorth", Version = "v1" });
  option.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
  {
    In = ParameterLocation.Header,
    Description = "Please enter a valid token",
    Name = "Authorization",
    Type = SecuritySchemeType.Http,
    BearerFormat = "JWT",
    Scheme = "Bearer"
  });
  option.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type=ReferenceType.SecurityScheme,
                    Id="Bearer"
                }
            },
            new string[]{}
        }
    });
});

//connect angular client

var allowedOrigins = builder.Configuration.GetValue<string>("allowedOrigins")!.Split(",");

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials()
              .WithExposedHeaders("Content-Disposition");
    });
});

builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IPropertyRepository, PropertyRepository>();
builder.Services.AddScoped<IFacilityRepository, FacilityRepository>();
builder.Services.AddScoped<IOfferRepository, OfferRepository>();
builder.Services.AddScoped<IFavouriteRepository, FavouriteRepository>();
builder.Services.AddScoped<IPropertyViewRepository, PropertyViewRepository>();
builder.Services.AddScoped<IImageRepository, ImageRepository>();
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
builder.Services.AddSignalR();


var app = builder.Build();


//role seeding
using (var scope = app.Services.CreateScope())
{
  var services = scope.ServiceProvider;
  SeedData.Initialize(services);
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseMigrationsEndPoint();
}
else
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.MapHub<OfferHub>("/hubs/offers");

//for the self assigned certificate errror
//app.UseHttpsRedirection();

app.UseStaticFiles();

app.UseRouting();
app.UseCors();
app.UseSwagger();
app.UseSwaggerUI();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");
app.MapRazorPages();

app.Run();
