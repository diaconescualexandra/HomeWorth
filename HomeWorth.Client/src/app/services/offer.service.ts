import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OfferResponseDto, OfferStatus } from '../models/offer-response-dto.model';
import { environment } from '../../environments/environment';
import { PagedResult } from '../models/paged-result-model-dto.model';
@Injectable({
  providedIn: 'root'
})
export class OfferService {
  private apiUrl = `${environment.apiURL}/api/Offers`;

  constructor(private http: HttpClient) { }

  // Get all offers for a property
  getOffersByPropertyId(propertyId: string, pageNumber: number = 1, pageSize: number = 10): Observable<PagedResult<OfferResponseDto>> {
  return this.http.get<PagedResult<OfferResponseDto>>(`${this.apiUrl}/property/${propertyId}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
}

  // Update offer status (accept/decline)
  updateOfferStatus(offerId: number, statusUpdate: { offerId: number, status: OfferStatus }): Observable<any> {
    return this.http.put(`${this.apiUrl}/${offerId}/status`, statusUpdate);
  }
  
  // Create an offer for a property
  createOffer(offer: any): Observable<OfferResponseDto> {
    return this.http.post<OfferResponseDto>(`${this.apiUrl}/property/${offer.propertyId}`, offer);
  }

  getBuyerInfo(offerId: number): Observable<{ email: string, phoneNumber: string, firstName: string, lastName: string }> {
  return this.http.get<{ email: string, phoneNumber: string, firstName: string, lastName: string }>(`${this.apiUrl}/${offerId}/buyer-info`);
}

  markAsViewed(offerId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${offerId}/viewed`, {});
  }

  getOffersMadeByBuyerorSeller(pageNumber: number = 1, pageSize: number = 10): Observable<PagedResult<OfferResponseDto>> {
    return this.http.get<PagedResult<OfferResponseDto>>(`${this.apiUrl}/my-offers?pageNumber=${pageNumber}&pageSize=${pageSize}`);
}

  checkForExpiredOffers(propertyId: string): void {
    this.getOffersByPropertyId(propertyId).subscribe(offers => {
      offers.data.forEach(offer => {
        if (offer.status === OfferStatus.VIEWED) {
          const viewedTime = new Date(offer.createdAt);
          const now = new Date();
          const hours = (now.getTime() - viewedTime.getTime()) / (1000 * 60 * 60);
          
          if (hours >= 48) {
            this.updateOfferStatus(offer.offerId, { 
              offerId: offer.offerId, 
              status: OfferStatus.EXPIRED 
            }).subscribe();
          }
        }
      });
    });
  }
}