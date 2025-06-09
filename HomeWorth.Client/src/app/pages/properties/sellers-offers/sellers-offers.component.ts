import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OfferResponseDto, OfferStatus } from '../../../models/offer-response-dto.model';
import { CommonModule } from '@angular/common';
import { OfferService } from '../../../services/offer.service';
import { SignalRService } from '../../../services/signal-r.service'; 
import { registerLocaleData } from '@angular/common';
import localeRo from '@angular/common/locales/ro';

registerLocaleData(localeRo);
@Component({
  selector: 'app-sellers-offers',
  imports: [CommonModule],
  templateUrl: './sellers-offers.component.html',
  styleUrl: './sellers-offers.component.css',
  standalone: true
})
export class SellersOffersComponent implements OnInit {
  propertyId: string = '';
  propertyTitle: string = '';
  offers: OfferResponseDto[] = [];
  isLoading: boolean = false;
  error: string | null = null;

  //pagination
  totalCount: number = 0; // backend needs to return this!
  page: number = 1;
  pageSize: number = 10;

  OfferStatus = OfferStatus;
  
  public mapStatus(status: number | string): OfferStatus {
  const num = typeof status === 'string' ? parseInt(status, 10) : status;
  switch (num) {
    case 0: return OfferStatus.IN_PROGRESS;
    case 1: return OfferStatus.ACCEPTED;
    case 2: return OfferStatus.DECLINED;
    case 3: return OfferStatus.VIEWED;
    case 4: return OfferStatus.EXPIRED;
    default: return OfferStatus.IN_PROGRESS;
  }
}
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private offerService: OfferService,
    private signalRService: SignalRService 
  ) {
    // Move state retrieval to constructor
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.propertyTitle = (navigation.extras.state as {propertyTitle: string}).propertyTitle;
      console.log('Property title in constructor:', this.propertyTitle);
    }
  }
  

  ngOnInit(): void {
  this.route.params.subscribe(params => {
    this.propertyId = params['id'];
    if (!this.propertyTitle) {
      this.loadPropertyDetails();
    }
    this.loadOffers(); 
  });
}
isOfferExpired(offer: OfferResponseDto): boolean {
    if (offer.status === OfferStatus.VIEWED) {
      const viewedTime = new Date(offer.createdAt);
      const now = new Date();
      const hours = (now.getTime() - viewedTime.getTime()) / (1000 * 60 * 60);
      return hours >= 48;
    }
    return false;
  }

  onPageChange(newPage: number) {
    this.page = newPage;
    this.loadOffers();
  }

revealBuyerInfo(offer: OfferResponseDto) {
    this.offerService.markAsViewed(offer.offerId).subscribe({
      next: () => {
        offer.status = OfferStatus.VIEWED;
        offer.showBuyerInfo = true;
        
        this.offerService.getBuyerInfo(offer.offerId).subscribe({
          next: (info) => {
            offer.email = info.email;
            offer.phoneNumber = info.phoneNumber;
            offer.firstName = info.firstName;
            offer.lastName = info.lastName;
          },
          error: (error) => {
            console.error('Error fetching buyer info:', error);
            this.error = 'Failed to load buyer information';
          }
        });
      },
      error: (error) => {
        console.error('Error marking offer as viewed:', error);
        this.error = 'Failed to mark offer as viewed';
      }
    });
  }

   checkExpiredOffers(): void {
    if (this.propertyId) {
      this.offerService.checkForExpiredOffers(this.propertyId);
    }
  }


  get actionableOffers(): OfferResponseDto[] {
    return this.offers.filter(o => 
      o.status !== OfferStatus.EXPIRED || 
      o.showBuyerInfo
    );
  }


  loadPropertyDetails(): void {
    if (!this.propertyTitle) {
      this.propertyTitle = `Property #${this.propertyId}`;
    }
  }
  

loadOffers(): void {
  this.isLoading = true;
  this.offerService.getOffersByPropertyId(this.propertyId, this.page, this.pageSize).subscribe({
    next: (pagedResult) => {

      this.totalCount = pagedResult.totalCount;
      const offers = pagedResult.data;

      const accepted = offers.find(o => o.status === OfferStatus.ACCEPTED);
      this.offers = accepted ? [accepted] : offers.filter(o =>
        o.status === OfferStatus.IN_PROGRESS ||
        o.status === OfferStatus.VIEWED
      );

      this.offers.forEach(o => {
        if (o.status === OfferStatus.VIEWED || o.status === OfferStatus.ACCEPTED) {
          o.showBuyerInfo = true;
        }
      });
      this.isLoading = false;
    },
    error: (err) => {
      this.error = 'Failed to load offers.';
      this.isLoading = false;
    }
  });
}


  acceptOffer(offerId: number): void {
    this.offerService.updateOfferStatus(offerId, { 
      offerId, 
      status: OfferStatus.ACCEPTED 
    }).subscribe({
      next: () => {
        this.offers = this.offers.filter(offer => offer.offerId === offerId);
        const offer = this.offers[0];
        if (offer) {
          offer.status = OfferStatus.ACCEPTED;
        }
      },
      error: (error) => {
        console.error('Error accepting offer:', error);
        this.error = 'Failed to accept offer';
      }
    });
  }

rejectOffer(offerId: number): void {
    this.offerService.updateOfferStatus(offerId, { 
      offerId, 
      status: OfferStatus.DECLINED 
    }).subscribe({
      next: () => {
        const offer = this.offers.find(o => o.offerId === offerId);
        if (offer) {
          offer.status = OfferStatus.DECLINED;
        }
      },
      error: (error) => {
        console.error('Error rejecting offer:', error);
        this.error = 'Failed to reject offer';
      }
    });
  }

  navigateBack(): void {
    this.router.navigate(['/my-properties']);
  }


}