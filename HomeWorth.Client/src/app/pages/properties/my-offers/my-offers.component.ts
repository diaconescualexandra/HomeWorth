import { Component, OnInit } from '@angular/core';
import { OfferResponseDto, OfferStatus } from '../../../models/offer-response-dto.model';
import { OfferService } from '../../../services/offer.service';
import { AuthService } from '../../../services/auth-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-offers',
  imports: [CommonModule],
  templateUrl: './my-offers.component.html',
  styleUrl: './my-offers.component.css'
})
export class MyOffersComponent implements OnInit {

  offers: OfferResponseDto[] = [];
  userRole: string = '';
  loading: boolean = false;
  OfferStatus = OfferStatus;
  sortOption: string = 'Most Recent';
  showSortDropdown = false;

  // Pagination properties
  totalCount: number = 0;
  page: number = 1;
  pageSize: number = 10;

  constructor(
    private offerService: OfferService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Subscribe once to user role and load initial offers
    this.authService.currentUserRole$.subscribe(role => {
      this.userRole = role;
      this.loadOffers();
    });
  }

  loadOffers(): void {
    this.loading = true;
    this.offerService.getOffersMadeByBuyerorSeller(this.page, this.pageSize).subscribe({
      next: pagedResult => {
        this.offers = pagedResult.data; // assuming pagedResult.Data is the list of offers
        this.totalCount = pagedResult.totalCount; // total offers count for pagination
        this.loading = false;
      },
      error: err => {
        console.error('Error loading offers:', err);
        this.loading = false;
      }
    });
  }

  onPageChange(newPage: number): void {
    this.page = newPage;
    this.loadOffers();
  }

  setSortOption(option: string): void {
    this.sortOption = option;
    this.showSortDropdown = false;
  }

  get sortedOffers(): OfferResponseDto[] {
    if (this.sortOption === 'Oldest') {
      return [...this.offers].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    return [...this.offers].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getStatusLabel(status: OfferStatus): string {
    switch (status) {
      case OfferStatus.ACCEPTED: return 'Accepted';
      case OfferStatus.DECLINED: return 'Declined';
      case OfferStatus.IN_PROGRESS: return 'In Progress';
      case OfferStatus.VIEWED: return 'Interested';
      case OfferStatus.EXPIRED: return 'Expired';
      default: return 'Unknown';
    }
  }

  get isSeller(): boolean {
    return this.userRole === 'Seller';
  }

  get isBuyer(): boolean {
    return this.userRole === 'Buyer';
  }
}
