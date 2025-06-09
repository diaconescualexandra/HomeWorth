using HomeWorth.Server.Data;
using HomeWorth.Server.DTOs.Offer;
using HomeWorth.Server.Interfaces;
using HomeWorth.Server.Mappers;
using HomeWorth.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HomeWorth.Server.Controllers
{
  [Route("api/[controller]")]
  [ApiController]
  public class OffersController : ControllerBase
  {
    private readonly IPropertyRepository _propertyRepository;
    private readonly IOfferRepository _offerRepository;
    private readonly INotificationRepository _notificationRepository;
    private readonly UserManager<ApplicationUser> _userManager;

    public OffersController(UserManager<ApplicationUser> userManager, IPropertyRepository propertyRepository, IOfferRepository offerRepository, INotificationRepository notificationRepository)
    {
      _propertyRepository = propertyRepository;
      _offerRepository = offerRepository;
      _notificationRepository = notificationRepository;
      _userManager = userManager;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllOffers(int pageNumber = 1, int pageSize = 10)
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);
      var pagedOffers = await _offerRepository.GetAllAsync(pageNumber, pageSize);
      var offerDtos = pagedOffers.Data.Select(o => o.ToOfferDto());

      var response = new
      {
        Data = offerDtos,
        TotalCount = pagedOffers.TotalCount
      };

      return Ok(response);
    }

    [HttpGet("{offerId}")]
    public async Task<IActionResult> GetOfferById(int offerId)
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);
      var offer = await _offerRepository.GetByIdAsync(offerId);
      if (offer == null)
      {
        return NotFound();
      }
      return Ok(offer.ToOfferDto());
    }

    [HttpGet("property/{propertyId}")]
    public async Task<IActionResult> GetOffersByPropertyId(Guid propertyId, int pageNumber = 1, int pageSize = 10)
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);

      var pagedResult = await _offerRepository.GetByPropertyIdAsync(propertyId, pageNumber, pageSize);
      var offerDtos = pagedResult.Data.Select(o => o.ToOfferDto());
      return Ok(new
      {
        Data = offerDtos,
        TotalCount = pagedResult.TotalCount
      });
    }

    [HttpPost("property/{propertyId}")]
    public async Task<IActionResult> Create([FromBody] OfferRequestDto offerRequestDto)
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);

      var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
      var offerModel = offerRequestDto.ToOfferFromDto();
      offerModel.status = OfferStatus.IN_PROGRESS;  // Ensure status is set
      offerModel.CreatedAt = DateTime.UtcNow;
      await _offerRepository.CreateAsync(offerModel, userId, offerRequestDto.propertyId);

      try
      {
        //notify the seller of the new offer
        var property = await _propertyRepository.GetByIdAsync(offerRequestDto.propertyId);
        if (property != null)
        {
          var sellerId = property.SellerId;
          if (!string.IsNullOrEmpty(sellerId))
          {
            await _notificationRepository.NotifySellerAsync(
                sellerId,
                $"You have received a new offer for your property!",
                NotificationType.OfferReceived
            );
          }
        }
      }
      catch (Exception ex)
      {
        // Log the error, but don't fail the offer creation
        Console.WriteLine("Notification error: " + ex.Message);
      }

      return CreatedAtAction(nameof(GetOfferById),
                 new { offerId = offerModel.offerId }, offerModel.ToOfferDto());
    }

    [HttpPut("{offerId}/status")]
    public async Task<IActionResult> UpdateStatus(int offerId, [FromBody] UpdateStatusOfferRequestDto updateStatusDto)
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);

      var offer = await _offerRepository.GetByIdAsync(offerId);
      if (offer == null)
      {
        return NotFound();
      }

      await _offerRepository.UpdateStatusAsync(updateStatusDto);

      try
      {
        if (updateStatusDto.status == OfferStatus.VIEWED)
        {
          await _notificationRepository.NotifyBuyerAsync(
              offer.buyerId,
              "The seller is interested in your offer!",
              NotificationType.OfferViewed  // You may need to add this to the enum
          );
        }
        else if (updateStatusDto.status == OfferStatus.ACCEPTED)
        {
          await _notificationRepository.NotifyBuyerAsync(
              offer.buyerId,
              "Your offer has been accepted by the seller!",
              NotificationType.OfferAccepted
          );

          await _offerRepository.DeclineOtherOffersAsync(offer.propertyId, offerId);
        }
      }
      catch (Exception ex)
      {
        Console.WriteLine("Notification error: " + ex.Message);
      }

      return Ok();
    }


    [HttpGet("{offerId}/buyer-info")]
    public async Task<IActionResult> GetBuyerInfo(int offerId)
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);

      var offer = await _offerRepository.GetBuyerInfoAsync(offerId);
      if (offer == null)
        return NotFound();

      // Only allow the property owner (seller) to see buyer info
      var property = await _propertyRepository.GetByIdAsync(offer.propertyId);
      var sellerId = property?.SellerId; // Adjust property model if needed
      var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

      if (sellerId == null || currentUserId != sellerId)
        return Forbid();

      var buyer = offer.Buyer;
      if (buyer == null)
        return NotFound("Buyer not found");

      return Ok(new BuyerInfoDto
      {
        email = buyer.Email,
        PhoneNumber = buyer.PhoneNumber,
        FirstName = buyer.FirstName,
        LastName = buyer.LastName
      });
    }
    [HttpPut("{offerId}/viewed")]
    public async Task<IActionResult> MarkAsViewed(int offerId)
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);

      var offer = await _offerRepository.GetByIdAsync(offerId);
      if (offer == null)
        return NotFound();

      var property = await _propertyRepository.GetByIdAsync(offer.propertyId);
      var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

      if (property == null || property.SellerId != currentUserId)
        return Forbid();

      offer.status = OfferStatus.VIEWED;
      await _offerRepository.UpdateStatusAsync(new UpdateStatusOfferRequestDto
      {
        offerId = offerId,
        status = OfferStatus.VIEWED
      });

      await _notificationRepository.NotifyBuyerAsync(
        offer.buyerId,
        "The seller is interested in your offer!",
        NotificationType.OfferViewed
    );

      return Ok();
    }

    [HttpGet("my-property/{propertyId}/history")]
    public async Task<IActionResult> GetHistoricalOffers(Guid propertyId, int pageNumber = 1, int pageSize = 10)
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);

      var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
      var property = await _propertyRepository.GetByIdAsync(propertyId);

      if (property == null || property.SellerId != currentUserId)
        return Forbid();

      var pagedResult = await _offerRepository.GetByPropertyIdAsync(propertyId, pageNumber, pageSize);

      var history = pagedResult.Data
          .Where(o => o.status == OfferStatus.ACCEPTED || o.status == OfferStatus.DECLINED)
          .Select(o => o.ToOfferDto());

      // Since filtering is after paging, you may want to rethink if filtering should be inside repo instead

      return Ok(history);
    }


    [HttpGet("my-offers")]
    public async Task<IActionResult> GetMyOffers(int pageNumber = 1, int pageSize = 10)
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);

      var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
      var user = await _userManager.FindByIdAsync(currentUserId);

      if (user == null) return Unauthorized();

      var roles = await _userManager.GetRolesAsync(user);

      if (roles.Contains("Buyer"))
      {
        var pagedResult = await _offerRepository.GetOffersByBuyerIdAsync(currentUserId, pageNumber, pageSize);
        var offerDtos = pagedResult.Data.Select(o => o.ToOfferDto());
        return Ok(new
        {
          Data = offerDtos,
          TotalCount = pagedResult.TotalCount
        });
      }
      else if (roles.Contains("Seller"))
      {
        var pagedResult = await _offerRepository.GetOffersForSellerAsync(currentUserId, pageNumber, pageSize );
        var offerDtos = pagedResult.Data.Select(o => o.ToOfferDto());
        return Ok(new
        {
          Data = offerDtos,
          TotalCount = pagedResult.TotalCount
        });
      }

      return Forbid(); // No appropriate role
    }


  }
}
