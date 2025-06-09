using HomeWorth.Server.DTOs.Offer;
using HomeWorth.Server.DTOs.Property;
using HomeWorth.Server.Models;

namespace HomeWorth.Server.Mappers
{
  public static class OfferMappers
  {
    public static OfferResponseDto ToOfferDto(this Offer offerModel)
    {
      var offerDto = new OfferResponseDto
      {
        propertyId = offerModel.propertyId,
        offeredAmount = offerModel.offeredAmount,
        offerId = offerModel.offerId,
        status = offerModel.status,
        CreatedAt = offerModel.CreatedAt,
        buyerId = offerModel.buyerId,
        firstName = offerModel.Buyer?.FirstName, 
        lastName = offerModel.Buyer?.LastName,   
        email = offerModel.Buyer?.Email,        
        phoneNumber = offerModel.Buyer?.PhoneNumber,
        propertyTitle = offerModel.Property?.title,
      };
      return offerDto;
    }

    public static Offer ToOfferFromDto(this OfferRequestDto offerDto)
    {
      var offerModel = new Offer
      {
        propertyId = offerDto.propertyId,
        offeredAmount = offerDto.offeredAmount,
        status = OfferStatus.IN_PROGRESS,  
        CreatedAt = DateTime.UtcNow
      };
      return offerModel;
    }
    public static Offer ToOfferFromUpdateStatusOfferRequestDto (this UpdateStatusOfferRequestDto offerDto)
    {
      var offerModel = new Offer
      {
        offerId = offerDto.offerId,
        status = offerDto.status,
      };
      return offerModel;
    }
  }
}
