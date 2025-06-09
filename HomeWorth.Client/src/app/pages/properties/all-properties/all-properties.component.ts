// Fixed code for AllPropertiesComponent

import { Component, OnInit, HostListener, ElementRef, OnDestroy } from '@angular/core';
import { PropertyResponseDto } from '../../../models/property-response-dto.model';
import { PropertyCardComponent } from '../property-card/property-card.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PropertyService, PropertyQueryObject } from '../../../services/property.service';
import { PropertyType } from '../../../models/property-type.enum';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth-service';
import { FavouritesService } from '../../../services/favourites.service';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { Subscription, Subject } from 'rxjs';
import { take, finalize, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PropertyViewsService } from '../../../services/property-views.service';
import { NotificationComponent } from '../../notification/notification.component';
import { ToastService } from '../../../services/toast.service';
import { PagedResult } from '../../../models/paged-result-model-dto.model';
@Component({
  selector: 'app-all-properties',
  imports: [CommonModule, PropertyCardComponent, FormsModule, NotificationComponent],
  standalone: true,
  templateUrl: './all-properties.component.html',
  styleUrl: './all-properties.component.css'
})
export class AllPropertiesComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();

  allProperties: PropertyResponseDto[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  
  // User role and auth info
  userRole: string = '';
  isAuthenticated: boolean = false;
  isBuyer: boolean = false;
  
  // For tracking favorites
  favoritePropertyIds: Set<string> = new Set();

  
  // Search, filter and sort properties
  searchInput: string = '';
  private searchSubject = new Subject<string>();
  
//pagination
  totalCount: number = 0; // backend needs to return this!
  page: number = 1;
  pageSize: number = 10;

  // Dropdown state
  showFilterDropdown: boolean = false;
  showSortDropdown: boolean = false;
  
  // Filter state
  filters: {
    propertyType?: string;
    rooms?: number;
    minPrice?: number;
    maxPrice?: number;
    excludeGroundFloor?: boolean;
    excludeTopFloor?: boolean; 
  } = {};
  
  // Price range slider
  priceRange: number = 500000; // Default middle value
  
  // Sort option
  sortOption: string | null = null;
  
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private propertyService: PropertyService,
    private favouritesService: FavouritesService,
    private authService: AuthService,
    private elementRef: ElementRef,
    private propertyViewsService: PropertyViewsService,
    private toastService: ToastService
  ) {}
  
  ngOnInit(): void {
    console.log('Initializing AllPropertiesComponent');
    this.authService.isLoggedIn$.pipe(take(1)).subscribe(isLoggedIn => {
      console.log('Auth state loaded, isLoggedIn:', isLoggedIn);
      this.isAuthenticated = isLoggedIn;
      
      this.authService.currentUserRole$.pipe(take(1)).subscribe(role => {
        console.log('User role:', role);
        this.userRole = role;
        this.isBuyer = role === 'Buyer';
        
        // If user is a buyer, load their favorites
        if (this.isAuthenticated && this.isBuyer) {
          this.loadFavorites();
        }
        
        // Load properties for everyone, regardless of role
        if (isPlatformBrowser(this.platformId)) {
          this.loadAllProperties();
        }
        
        // Set up search subscription with debounce
         const searchSubscription = this.searchSubject
          .pipe(
            debounceTime(800), // 400ms is a good UX value
            distinctUntilChanged()
          )
          .subscribe((searchTerm) => {
            this.searchInput = searchTerm; // update the searchInput property
            this.loadAllProperties();      // only load properties after debounce
          });
        this.subscriptions.add(searchSubscription);
      });
    });
  }
  
 onSearchInputChange(value: string): void {
  this.searchSubject.next(value); // Only push to subject, do not call applyFilters()
}
  
  onSearchKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent form submission which would cause page reload
      console.log('Enter key pressed, searching for:', this.searchInput);
      // Force immediate search and cancel any pending debounced search
      this.searchSubject.next(this.searchInput);
    }
  }
  
  // Load user's favorites to mark properties accordingly
  loadFavorites(): void {
  this.favouritesService.getBuyersFavourites(this.page, this.pageSize).subscribe({
    next: (response) => {

      const favorites = response.data;
      this.totalCount = response.totalCount;
      // Create a set of favorited property IDs for quick lookup
      this.favoritePropertyIds = new Set(favorites.map(f => f.propertyId));

      // If properties are already loaded, update their favorite status
      if (this.allProperties.length > 0) {
        this.updateFavoriteStatus();
      }
    },
    error: (err) => {
      console.error('Error loading favorites:', err);
    }
  });
}

  
  // Update each property's favorite status
  private updateFavoriteStatus(): void {
    // Since the PropertyCardComponent handles its own favorite state,
    // we don't need to update anything here directly.
    // The PropertyCardComponent will check if a property is in favorites.
  }
  
  loadAllProperties(): void {
    console.log('Loading all properties with search term:', this.searchInput);
    this.error = null;
    this.isLoading = true;
    
    // Create query object based on filters
    const queryParams: PropertyQueryObject = {
      PageNumber: this.page,
      PageSize: this.pageSize,
      SortBy: 'yearBuilt',  // Default sort
      IsDescending: true,
      ExcludeGroundFloor: this.filters.excludeGroundFloor,
      ExcludeTopFloor: this.filters.excludeTopFloor,
    };
    
    // Add search term if present (trim to remove whitespace)
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
    
    // Handle popularity sorting separately since it's a special case
    if (this.sortOption === 'Popularity') {
      // Determine how many properties to load
      const countToLoad = 20;
      
      this.propertyViewsService.getMostViewdProperties(countToLoad).subscribe({
        next: (properties) => {
          console.log('Most viewed properties loaded successfully:', properties.length);
          this.allProperties = properties;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading most viewed properties:', err);
          // Fallback to default loading if the API fails
          this.loadPropertiesWithQueryParams(queryParams);
        }
      });
    } else {
      // Regular sorting and filtering
      this.loadPropertiesWithQueryParams(queryParams);
    }
  }
  
  // Helper method to load properties with given query params
  private loadPropertiesWithQueryParams(queryParams: PropertyQueryObject): void {
    console.log('Loading properties with query params:', queryParams);
    
    const subscription = this.propertyService.getAllProperties(queryParams)
      .subscribe({
        next: (response) => {
          this.allProperties = response.data;
          this.totalCount = response.totalCount ?? 0;
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.allProperties = [];
          this.totalCount = 0;
          this.toastService.show("Error loading properties", 'error');
        }
      });
    
    this.subscriptions.add(subscription);
  }
  onPageChange(newPage: number) {
    this.page = newPage;
    this.loadAllProperties();
  }
  ngOnDestroy(): void {
    console.log('Destroying AllPropertiesComponent');
    this.subscriptions.unsubscribe();
  }
  
  // Handle favorite toggle from property card
  handleFavoriteToggle(event: {propertyId: string, isFavorite: boolean}): void {
    if (!this.isAuthenticated) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    
    if (!this.isBuyer) {
      alert('Only buyers can add properties to favorites.');
      return;
    }
    
    console.log('Handling favorite toggle:', event);
    
    if (event.isFavorite) {
      this.favouritesService.addToFavourites({ propertyId: event.propertyId }).subscribe({
        next: () => {
          this.favoritePropertyIds.add(event.propertyId);
        },
        error: (err) => {
          alert('Failed to add property to favorites. Please try again.');
        }
      });
    } else {
      this.favouritesService.removeFromFavourites(event.propertyId).subscribe({
        next: () => {
          this.favoritePropertyIds.delete(event.propertyId);
        },
        error: (err) => {
          alert('Failed to remove property from favorites. Please try again.');
        }
      });
    }
  }
  
  // Check if a property is in user's favorites
  isPropertyFavorite(propertyId: string): boolean {
    return this.favoritePropertyIds.has(propertyId);
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
    console.log('Applying filters with search term:', this.searchInput);
    
    // Close any open dropdowns
    this.showFilterDropdown = false;
    this.showSortDropdown = false;
    
    // Show loading state
    this.isLoading = true;
    
    // Load properties with the current filters
    this.loadAllProperties();
  }
  
  hasActiveFilters(): boolean {
    return !!(
        this.filters.propertyType ||
        this.filters.excludeGroundFloor ||
        this.filters.excludeTopFloor ||
        this.filters.rooms ||
        this.filters.minPrice !== undefined ||
        this.filters.maxPrice !== undefined ||
        this.sortOption
    );
  }
  
  removeFilter(filterKey: string): void {
    switch (filterKey) {
        case 'propertyType':
            this.filters.propertyType = undefined;
            break;
        case 'excludeGroundFloor':
            this.filters.excludeGroundFloor = false;
            break;
        case 'excludeTopFloor':
            this.filters.excludeTopFloor = false;
            break;
        case 'rooms':
            this.filters.rooms = undefined;
            break;
    }
    this.loadAllProperties();
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
    this.applyFilters();
  }
  
  @HostListener('document:click', ['$event.target'])
  public onClick(target: any) {
    const clickedInside = this.elementRef.nativeElement.contains(target);
    if (!clickedInside) {
      this.closeDropdowns();
    }
  }
}