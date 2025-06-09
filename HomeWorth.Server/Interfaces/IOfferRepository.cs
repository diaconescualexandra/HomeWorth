using HomeWorth.Server.DTOs.Offer;
using HomeWorth.Server.Helpers;
using HomeWorth.Server.Models;

namespace HomeWorth.Server.Interfaces
{
  public interface IOfferRepository
  {
    Task<PagedResult<Offer>> GetAllAsync(int pageNumber, int pageSize);
    Task<Offer?> GetByIdAsync(int offerId);
    Task<PagedResult<Offer>> GetByPropertyIdAsync(Guid propertyId, int pageNumber, int pageSize);
    Task<Offer> CreateAsync(Offer offerModel, string userId, Guid propertyId);
    Task UpdateStatusAsync(UpdateStatusOfferRequestDto offer);
    Task DeclineOtherOffersAsync(Guid propertyId, int acceptedOfferId);
    Task<Offer?> GetBuyerInfoAsync(int offerId);
    Task<PagedResult<Offer>> GetOffersByBuyerIdAsync(string buyerId, int pageNumber, int pageSize);
    Task<PagedResult<Offer>> GetOffersForSellerAsync(string sellerId, int pageNumber, int pageSize);

  }
}
