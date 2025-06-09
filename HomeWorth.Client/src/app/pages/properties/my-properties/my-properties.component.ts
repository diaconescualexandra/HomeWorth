import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { PropertyResponseDto } from '../../../models/property-response-dto.model';
import { PropertyCardComponent } from '../property-card/property-card.component';
import { CommonModule } from '@angular/common';
import { OfferStatus } from '../../../models/offer-response-dto.model';
import { Router } from '@angular/router';
import { PropertyService, PropertyQueryObject } from '../../../services/property.service';
import { OfferService } from '../../../services/offer.service';
import { PropertyType } from '../../../models/property-type.enum';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth-service';
import { PropertyViewsService } from '../../../services/property-views.service';
import { Subject, Subscription } from 'rxjs';
import { SignalRService } from '../../../services/signal-r.service';
import { ToastService } from '../../../services/toast.service';
import { NotificationComponent } from "../../notification/notification.component";
@Component({
  selector: 'app-my-properties',
  imports: [CommonModule, PropertyCardComponent, FormsModule, NotificationComponent],
  standalone: true,
  templateUrl: './my-properties.component.html',
  styleUrl: './my-properties.component.css'
})
export class MyPropertiesComponent implements OnInit {
  private subscriptions = new Subscription();

  myProperties: PropertyResponseDto[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  propertyToDelete: string | null = null;
  
  //pagination
  totalCount: number = 0; // backend needs to return this!
  page: number = 1;
  pageSize: number = 10;

  // Authentication and role state
  isSeller: boolean = false;
  isAuthenticated: boolean = false;
  
  // Search, filter and sort properties
  searchInput: string = '';
  
  // Dropdown state
  showFilterDropdown: boolean = false;
  showSortDropdown: boolean = false;
  
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
  
  constructor(
    private router: Router,
    private propertyService: PropertyService,
    private offerService: OfferService,
    private authService: AuthService,
    private elementRef: ElementRef,
    private propertyViewsService: PropertyViewsService,
    private signalRService: SignalRService,
    private toastService: ToastService,
  ) {}
  
  ngOnInit(): void {
    // Check authentication and role
     const authSubscription = this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isAuthenticated = isLoggedIn;
      this.signalRService.startConnection()

      // If not authenticated, redirect to login
      if (!isLoggedIn) {
        this.router.navigate(['/login'], { 
          queryParams: { returnUrl: this.router.url } 
        });
        return;
      }
      
      // Check if user is a seller
      const roleSubscription = this.authService.currentUserRole$.subscribe(role => {
        this.isSeller = role === 'Seller';
        
        // If not a seller, redirect to home page
        if (!this.isSeller) {
          this.router.navigate(['/home']);
          return;
        }

        // If authenticated and is a seller, load properties
        this.loadMyProperties();
      });
      
      this.subscriptions.add(roleSubscription);
    });
    
    this.subscriptions.add(authSubscription);
  }
  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    this.subscriptions.unsubscribe();
  }
 
  // Handle the Enter key press in the search input
  onSearchKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent form submission (page refresh)
      console.log('Search on Enter key:', this.searchInput);
      this.loadMyProperties();
    }
  }
  loadMyProperties(): void {
    console.log('Loading my properties with search term:', this.searchInput);
    this.isLoading = true;
    this.error = null;
    
    // Create query object based on filters
    const queryParams: PropertyQueryObject = {
      PageNumber: this.page,
      PageSize: this.pageSize,
      SortBy: 'yearBuilt',
      IsDescending: true
    };
    
    // Add search term if present (trim to avoid empty spaces)
    if (this.searchInput && this.searchInput.trim().length > 0) {
      queryParams.SearchTerm = this.searchInput.trim();
      console.log('Adding search term to query:', queryParams.SearchTerm);
    }
    
    // Add property type filter
    if (this.filters.propertyType) {
      queryParams.PropertyType = this.filters.propertyType === 'Apartment' ? 
        PropertyType.Flat : PropertyType.House;
    }
    
    // Add rooms filter
    if (this.filters.rooms) {
      queryParams.noOfRooms = this.filters.rooms.toString();
    }
    
    // Add price range filter
    if (this.filters.minPrice !== undefined) {
      queryParams.MinPrice = this.filters.minPrice;
    }
    
    if (this.filters.maxPrice !== undefined) {
      queryParams.MaxPrice = this.filters.maxPrice;
    }
    
    // Add sort options
    if (this.sortOption) {
      switch(this.sortOption) {
        case 'Price (Low to High)':
          queryParams.SortBy = 'price';
          queryParams.IsDescending = false;
          break;
        case 'Price (High to Low)':
          queryParams.SortBy = 'price';
          queryParams.IsDescending = true;
          break;
        case 'Size (Small to Large)':
          queryParams.SortBy = 'size';
          queryParams.IsDescending = false;
          break;
        case 'Year (Newest First)':
          queryParams.SortBy = 'yearBuilt';
          queryParams.IsDescending = true;
          break;
      }
    }
    
    if (this.sortOption === 'Popularity') {
      // If sorting by popularity, first get most viewed properties
      const countToLoad = 50; // Get a large number to filter later
      
      const popularitySubscription = this.propertyViewsService.getMostViewdProperties(countToLoad).subscribe({
        next: (properties) => {
          // Filter only the properties that belong to the current user
          const userId = this.authService.getUserId();
          this.myProperties = properties.filter(p => p.sellerId === userId);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading most viewed properties:', err);
          // Fallback to default loading if the API fails
          this.loadPropertiesWithRegularSorting(queryParams);
        }
      });
      
      this.subscriptions.add(popularitySubscription);
    } else {
      // Regular sorting and filtering
      this.loadPropertiesWithRegularSorting(queryParams);
    }
  }

  private loadPropertiesWithRegularSorting(queryParams: PropertyQueryObject): void {
  console.log('Loading properties with regular sorting:', queryParams);
  
    const subscription = this.propertyService.getMyProperties(queryParams).subscribe({
    next: (response) => {
      this.myProperties = response.data ?? [];
      this.totalCount = response.totalCount ?? 0;
      this.isLoading = false;
    },
    error: (err) => {
      console.error('Failed to load properties:', err);
      this.toastService.show('Failed to load properties.', 'error');
      this.isLoading = false;
      this.myProperties = [];
      this.totalCount = 0;
    }
  });


  this.subscriptions.add(subscription);
}

  handleOfferAccepted(offerId: number): void {
    // Verify seller role before proceeding
    if (!this.isSeller) {
      this.toastService.show('Only sellers can accept offers.', 'warning');
      return;
    }
    
    const statusUpdate = {
      offerId: offerId,
      status: OfferStatus.ACCEPTED
    };
    
    this.offerService.updateOfferStatus(offerId, statusUpdate).subscribe({
      next: () => {
        this.toastService.show('Offer accepted successfully.', 'success');
        // Refresh the properties to show updated offer status
        this.loadMyProperties();
      },
      error: (err) => {
        this.toastService.show('Failed to accept offer', 'error');
      }
    });
  }

  onPageChange(newPage: number) {
  this.page = newPage;
  this.loadMyProperties();
}
  
  handleOfferDeclined(offerId: number): void {
    // Verify seller role before proceeding
    if (!this.isSeller) {
      this.toastService.show('Only sellers can decline offers.', 'warning');
      return;
    }
    
    const statusUpdate = {
      offerId: offerId,
      status: OfferStatus.DECLINED
    };
    
    this.offerService.updateOfferStatus(offerId, statusUpdate).subscribe({
      next: () => {
        this.toastService.show('Offer declined successfully.', 'success');
        // Refresh the properties to show updated offer status
        this.loadMyProperties();
      },
      error: (err) => {
        this.toastService.show('Failed to decline offer', 'error');
      }
    });
  }
  
  handleNavigateToOffers(propertyId: string): void {
  // Verify seller role before proceeding
  if (!this.isSeller) {
    this.toastService.show('Only sellers can view offers.', 'warning');
    return;
  }

  console.log('MyProperties: handleNavigateToOffers called with ID:', propertyId);
  // No need to convert to string
  const property = this.myProperties.find(p => p.propertyId === propertyId);

  // Check if this property belongs to the current seller
  if (this.verifyPropertyOwnership(property)) {
    this.router.navigate(['/offers', propertyId], {
      state: { propertyTitle: property?.title }
    });
  } else {
    this.toastService.show('You can only view offers for properties you own.', 'warning');
  }
}
  
  handleNavigateToEdit(propertyId: string): void {
  if (!this.isSeller) {
    this.toastService.show('Only sellers can edit properties.', 'warning');
    return;
  }

  console.log('MyProperties: handleNavigateToEdit called with ID:', propertyId);
  const propertyToEdit = this.myProperties.find(p => p.propertyId === propertyId);

  if (this.verifyPropertyOwnership(propertyToEdit)) {
    this.router.navigate(['/edit-property', propertyId], {
      state: { property: propertyToEdit }
    });
  } else {
    this.toastService.show('You can only edit properties you own.', 'warning');
  }
}
  
  handleDeleteProperty(propertyId: string): void {
  if (!this.isSeller) {
    this.toastService.show('Only sellers can delete properties.', 'warning');
    return;
  }
  const propertyToDelete = this.myProperties.find(p => p.propertyId === propertyId);
  if (!this.verifyPropertyOwnership(propertyToDelete)) {
    this.toastService.show('You can only delete properties you own.', 'warning');
    return;
  }
  this.propertyToDelete = propertyId; // Show modal
}

confirmDeleteProperty(): void {
  if (!this.propertyToDelete) return;
  this.propertyService.deleteProperty(this.propertyToDelete).subscribe({
    next: () => {
      this.myProperties = this.myProperties.filter(p => p.propertyId !== this.propertyToDelete);
      this.toastService.show('Property deleted successfully', 'success');
      this.propertyToDelete = null;
    },
    error: (err) => {
      this.toastService.show('Failed to delete property. Please try again later.', 'error');
      this.propertyToDelete = null;
    }
  });
}
  
  // Helper method to verify property ownership
  private verifyPropertyOwnership(property: PropertyResponseDto | undefined): boolean {
    if (!property) return false;
    
    const currentUserId = this.authService.getUserId();
    return property.sellerId === currentUserId;
  }
  
  // Filter and sort methods
  toggleFilterDropdown(event: Event): void {
    event.stopPropagation(); // Prevent immediate closing
    
    // Close sort dropdown if open
    this.showSortDropdown = false;
    
    // Toggle filter dropdown
    this.showFilterDropdown = !this.showFilterDropdown;
  }
  
  toggleSortDropdown(event: Event): void {
    event.stopPropagation(); // Prevent immediate closing
    
    // Close filter dropdown if open
    this.showFilterDropdown = false;
    
    // Toggle sort dropdown
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
    // Set min and max based on slider value
    this.filters.minPrice = Math.max(0, this.priceRange - 100000);
    this.filters.maxPrice = this.priceRange + 100000;
  }
  
  applyFilters(): void {
    // Close dropdown
    this.showFilterDropdown = false;
    
    // Apply filters by reloading data
    this.loadMyProperties();
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
    this.priceRange = 500000; // Reset slider
    this.applyFilters();
  }
  
  removeSort(): void {
    this.sortOption = null;
    this.applyFilters();
  }
  
  clearAllFilters(): void {
    this.filters = {};
    this.sortOption = null;
    this.priceRange = 500000; // Reset slider
    this.searchInput = '';
    this.applyFilters();
  }
  
  setSortOption(option: string): void {
    this.sortOption = option;
    this.showSortDropdown = false;
    this.applyFilters();
  }
  
  onSearch(): void {
    this.loadMyProperties();
  }
  
  @HostListener('document:click', ['$event.target'])
  public onClick(target: any) {
    const clickedInside = this.elementRef.nativeElement.contains(target);
    if (!clickedInside) {
      this.closeDropdowns();
    }
  }
  
  // Helper method to convert PropertyType enum to readable string
  getPropertyTypeText(type: PropertyType | number): string {
    return type === PropertyType.Flat ? 'Apartment' : 'House';
  }
}