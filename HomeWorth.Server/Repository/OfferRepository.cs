using HomeWorth.Server.Data;
using HomeWorth.Server.DTOs.Offer;
using HomeWorth.Server.Helpers;
using HomeWorth.Server.Interfaces;
using HomeWorth.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace HomeWorth.Server.Repository
{
  public class OfferRepository : IOfferRepository
  {
    private readonly ApplicationDbContext _context;

    public OfferRepository(ApplicationDbContext context)
    {
      _context = context;
    }

    public async Task<Offer> CreateAsync(Offer offerModel, string userId, Guid propertyId)
    {
      offerModel.buyerId = userId;
      offerModel.propertyId = propertyId;

      await _context.Offers.AddAsync(offerModel);
      await _context.SaveChangesAsync();
      return offerModel;

    }

    public async Task DeclineOtherOffersAsync(Guid propertyId, int acceptedOfferId)
    {
      var notAcceptedExistingOffers = await _context.Offers
        .Where( o => o.propertyId == propertyId &&
                o.offerId != acceptedOfferId &&
                o.status == OfferStatus.IN_PROGRESS).ToListAsync();
      foreach (var offer in notAcceptedExistingOffers)
      {
        offer.status = OfferStatus.DECLINED;
          
      }
      await _context.SaveChangesAsync(); 

    }

    public async Task<PagedResult<Offer>> GetAllAsync(int pageNumber, int pageSize)
    {
      var query = _context.Offers.AsQueryable();

      var totalCount = await query.CountAsync();

      var data = await query
        .Skip((pageNumber - 1) * pageSize)
        .Take(pageSize)
        .ToListAsync();

      return new PagedResult<Offer> { Data = data, TotalCount = totalCount };
    }

    public async Task<Offer?> GetByIdAsync(int offerId)
    {
      return await _context.Offers.FirstOrDefaultAsync(o => o.offerId == offerId);
    }

    public async Task<PagedResult<Offer>> GetByPropertyIdAsync(Guid propertyId, int pageNumber, int pageSize)
    {
      var query = _context.Offers
          .Include(o => o.Buyer)
          .Where(o => o.propertyId == propertyId);

      var totalCount = await query.CountAsync();

      var data = await query
          .Skip((pageNumber - 1) * pageSize)
          .Take(pageSize)
          .ToListAsync();

      return new PagedResult<Offer>
      {
        Data = data,
        TotalCount = totalCount
      };
    }

    public async Task UpdateStatusAsync(UpdateStatusOfferRequestDto offer)
    {
      var existingOffer = await _context.Offers.FirstOrDefaultAsync(o => o.offerId == offer.offerId);

      if (existingOffer != null)
      {
        existingOffer.status = offer.status;
      }
      await _context.SaveChangesAsync();

    }
    public async Task<Offer?> GetBuyerInfoAsync(int offerId)
    {
      return await _context.Offers
        .Include(o => o.Buyer)
        .FirstOrDefaultAsync(o => o.offerId == offerId);

    }

    public async Task<PagedResult<Offer>> GetOffersByBuyerIdAsync(string buyerId, int pageNumber, int pageSize)
    {
      var query = _context.Offers
          .Include(o => o.Buyer)
          .Include(o => o.Property)
          .Where(o => o.buyerId == buyerId);

      var totalCount = await query.CountAsync();

      var data = await query
          .Skip((pageNumber - 1) * pageSize)
          .Take(pageSize)
          .ToListAsync();

      return new PagedResult<Offer>
      {
        Data = data,
        TotalCount = totalCount
      };

    }

    public async Task<PagedResult<Offer>> GetOffersForSellerAsync(string sellerId, int pageNumber, int pageSize)
    {
      var query = _context.Offers
          .Include(o => o.Buyer)
          .Include(o => o.Property)
          .Where(o => o.Property.SellerId == sellerId);

      var totalCount = await query.CountAsync();

      var data = await query
          .Skip((pageNumber - 1) * pageSize)
          .Take(pageSize)
          .ToListAsync();

      return new PagedResult<Offer>
      {
        Data = data,
        TotalCount = totalCount
      };

    }

  }
}
