import { Component, EventEmitter, Input, Output, ElementRef, HostListener, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PropertyResponseDto } from '../../../models/property-response-dto.model';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../../../services/property.service';
import { AuthService } from '../../../services/auth-service';
import { PropertyType } from '../../../models/property-type.enum';
import { PropertyViewsService } from '../../../services/property-views.service';
import { PropertyStatus } from '../../../models/property-response-dto.model';
@Component({
  selector: 'app-property-card',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './property-card.component.html',
  styleUrl: './property-card.component.css',
  standalone: true,
})
export class PropertyCardComponent implements OnInit {
  @Input() property: PropertyResponseDto | null = null;
  @Input() isFavoritePage: boolean = false;
  @Input() isFavorite: boolean = false;
  @Input() isAdminView = false;


  @Output() statusChanged = new EventEmitter<{propertyId: string, newStatus: PropertyStatus}>();
  @Output() navigateToOffersEvent = new EventEmitter<string>();
  @Output() navigateToEditEvent = new EventEmitter<string>();
  @Output() deletePropertyEvent = new EventEmitter<string>(); // seller deletes property
  @Output() propertyDeleted = new EventEmitter<string>(); // remove from favorites
  @Output() clickOutside = new EventEmitter<void>();
  @Output() favoriteToggled = new EventEmitter<{propertyId: string, isFavorite: boolean}>();
  isVisible: boolean = true;
  searchInput: string = '';
  
  // Dropdown state
  showFilterDropdown: boolean = false;
  showSortDropdown: boolean = false;
  PropertyStatus = PropertyStatus; 
  
  // Filter state
  filters: {
    propertyType?: string;
    rooms?: number;
    minPrice?: number;
    maxPrice?: number;
  } = {};
  
  // Price range slider
  priceRange: number = 500000; // Default middle value
  
  // Sort option
  sortOption: string | null = null;
  
  // Platform check for SSR compatibility
  private isBrowser: boolean;
  
  // User role - replace mock with real auth
  userRole: string = '';
  isAuthenticated: boolean = false;
  isSeller: boolean = false;
  isBuyer: boolean = false;
  
  constructor(
    private router: Router, 
    private elementRef: ElementRef,
    private propertyService: PropertyService,
    private authService: AuthService,
    private propertyViewsService: PropertyViewsService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  updatePropertyStatus(status: PropertyStatus, event: Event) {
    event.stopPropagation();
    
    // Prevent accepting rejected properties
    if (this.propertyData.status === PropertyStatus.Rejected && status === PropertyStatus.Accepted) {
      return;
    }
    
    this.statusChanged.emit({
      propertyId: this.propertyData.propertyId,
      newStatus: status
    });
  }
  
  onImageError(event: any) {
      event.target.src = 'https://picsum.photos/240/240'; // default image
    }

  getStatusText(status: number): string {
        return PropertyStatus[status]; 
    }
  
  

  get propertyData(): PropertyResponseDto {
    // If there's a property, return it
    if (this.property) {
        return this.property;
    }

    // Only return default values if there's no property
    return {
        propertyId: '',
        title: '',
        description: '',
        noOfRooms: "0",
        price: 0,
        city: '',
        neighborhood: '',
        address: '',
        yearBuilt: 0,
        size: 0,
        date: new Date(),
        latitude: 0,
        longitude: 0,
        propertyType: PropertyType.Flat,
        floorNo: 0,
        images: [],
        facilities: [],
        views: {
            viewsCount: 0,
            viewedAt: new Date(),
        },
        offers: [],
        sellerId: '',
        sellerFirstName: '',
        status: PropertyStatus.Pending, 
    };
}

  ngOnInit() {
    // Get user role and authentication status
    this.authService.currentUserRole$.subscribe(role => {
      this.userRole = role;
      this.isSeller = role === 'Seller';
      this.isBuyer = role === 'Buyer';
    });
    
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isAuthenticated = isLoggedIn;
    });
    
    if (this.isFavoritePage) {
      this.isFavorite = true;
    }
    if (this.isSeller && this.isPropertyOwner()) {
    this.displayViewsCount();
    }

  }

   getOffersCount(): number {
    return this.propertyData.offers ? this.propertyData.offers.length : 0;
    }
  
  
  displayViewsCount() {
  this.propertyViewsService.getPropertyViewCounts([this.propertyData.propertyId]).subscribe({
    next: (counts) => {
      const count = counts[this.propertyData.propertyId] || 0;
      if (this.propertyData.views) {
        this.propertyData.views.viewsCount = count;
      } else {
        this.propertyData.views = { viewsCount: count, viewedAt: new Date() };
      }
      console.log('Property view count:', count);
    },
    error: (err) => {
      console.error('Error retrieving property view count:', err);
    }
  });
}
  navigateToDetails(propertyId: string) {
    if (!this.isSeller) {
      this.router.navigate(['/property-details', propertyId]);
    }
  }

  toggleFavorite(event: Event): void {
    event.stopPropagation();
    
    // Toggle local state for immediate UI feedback before API call
    const newFavoriteState = !this.isFavorite;
    
    // Emit event with the updated state
    this.favoriteToggled.emit({ 
      propertyId: this.propertyData.propertyId, 
      isFavorite: newFavoriteState  // Send the new state (true = is now favorite, false = is now not favorite)
    });
    
    // Only update local state after successful API call is handled in parent component
    console.log(`Toggled favorite for property ${this.propertyData.propertyId} to ${newFavoriteState}`);
  }
  
  emitNavigateToOffers(event: Event): void {
    event.stopPropagation();
    this.navigateToOffersEvent.emit(this.propertyData.propertyId);
  }
  
  emitNavigateToEdit(event: Event): void {
    event.stopPropagation();
    this.navigateToEditEvent.emit(this.propertyData.propertyId);
  }
  
  emitDeleteProperty(event: Event): void {
    event.stopPropagation();
    
    if (this.isFavoritePage) {
      // On the favorites page, we want to remove from favorites
      this.propertyDeleted.emit(this.propertyData.propertyId);
      // We should also update the local state for visual feedback
      this.isFavorite = false;
    } else {
      // Regular property deletion (for sellers)
      this.deletePropertyEvent.emit(this.propertyData.propertyId);
    }
  }
  // Check if current user is the owner of this property
  isPropertyOwner(): boolean {
    if (!this.isAuthenticated) return false;
    if (!this.propertyData) return false;
    if (!this.propertyData.sellerId) return false;
    
    const userId = this.authService.getUserId();
    console.log('Comparing property owner:', {
      userId,
      sellerId: this.propertyData.sellerId,
      match: userId === this.propertyData.sellerId
    });
    
    return userId === this.propertyData.sellerId;
  }
  
  // The rest of your filter and dropdown methods remain the same
  toggleFilterDropdown(event: Event): void {
    event.stopPropagation();
    this.showSortDropdown = false;
    this.showFilterDropdown = !this.showFilterDropdown;
  }
  
  toggleSortDropdown(event: Event): void {
    event.stopPropagation();
    this.showFilterDropdown = false;
    this.showSortDropdown = !this.showSortDropdown;
  }
  
  closeDropdowns(): void {
    this.showFilterDropdown = false;
    this.showSortDropdown = false;
  }
  
  setPropertyTypeFilter(type: string): void {
    this.filters.propertyType = type;
  }
  
  setRoomsFilter(rooms: number): void {
    this.filters.rooms = rooms;
  }
  
  updatePriceRangeFilter(): void {
    this.filters.minPrice = Math.max(0, this.priceRange - 100000);
    this.filters.maxPrice = this.priceRange + 100000;
  }
  
  applyFilters(): void {
    this.showFilterDropdown = false;
    console.log('Applying filters:', this.filters);
  }
  
  hasActiveFilters(): boolean {
    return !!this.filters.propertyType || 
           !!this.filters.rooms || 
           (this.filters.minPrice !== undefined && this.filters.maxPrice !== undefined) ||
           !!this.sortOption;
  }
  
  removeFilter(filterKey: string): void {
    if (filterKey in this.filters) {
      delete this.filters[filterKey as keyof typeof this.filters];
      this.applyFilters();
    }
  }
  
  removePriceRangeFilter(): void {
    delete this.filters.minPrice;
    delete this.filters.maxPrice;
    this.priceRange = 500000;
    this.applyFilters();
  }
  
  removeSort(): void {
    this.sortOption = null;
    console.log('Removing sort');
  }
  
  clearAllFilters(): void {
    this.filters = {};
    this.sortOption = null;
    this.priceRange = 500000;
    this.applyFilters();
    console.log('All filters cleared');
  }
  
  setSortOption(option: string): void {
    this.sortOption = option;
    this.showSortDropdown = false;
    console.log('Setting sort option:', option);
  }
  
  onSearch(): void {
    console.log('Searching:', this.searchInput);
  }

  @HostListener('document:click', ['$event.target'])
  public onClick(target: any) {
    if (!this.isBrowser) return;
    
    const clickedInside = this.elementRef.nativeElement.contains(target);
    if (!clickedInside) {
      this.clickOutside.emit();
    }
  }
}