import { Component, OnInit } from '@angular/core';
import { PropertyResponseDto } from '../../../models/property-response-dto.model';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { FacilityDto } from '../../../models/facility-dto.model';
import { PropertyService } from '../../../services/property.service';
import { AuthService } from '../../../services/auth-service';
import { PropertyViewsService } from '../../../services/property-views.service';
import { AddPropertyViewRequestDto } from '../../../models/add-property-view-request-sto.model';
import { OfferService } from '../../../services/offer.service';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../services/toast.service';
declare let L: any;

@Component({
  selector: 'app-property-details',
  imports: [CommonModule, RouterModule, FormsModule],
  standalone: true,
  templateUrl: './property-details.component.html',
  styleUrl: './property-details.component.css'
})
export class PropertyDetailsComponent implements OnInit {
  currentImageIndex: number = 0;
  
  propertyDetails!: PropertyResponseDto;
  propertyId: string = '';
  isLoading: boolean = true;
  errorMessage: string = '';
  offerPrice: number | null = null;
  offerError: string | null = null;

  priceCategory: string = '';
  isFavorite: boolean = false;
  private map: any;
  isImageLoading: boolean = true;
  isMapLoading: boolean = true;
  
  // User role info
  userRole: string = '';
  isAuthenticated: boolean = false;
  isBuyer: boolean = false;

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private propertyService: PropertyService,
    private authService: AuthService,
    private propertyViewsService: PropertyViewsService,
    private offerService: OfferService,
    private toastService: ToastService,
  ) {}

  get currentImage(): string {
    if (this.propertyDetails && this.propertyDetails.images && this.propertyDetails.images.length > 0) {
      return this.propertyDetails.images[this.currentImageIndex].imageUrl;
    }
    return 'https://picsum.photos/800/400'; // Fallback image
  }

  onImageLoad() {
    this.isImageLoading = false;
  }

  onMapLoad() {
    this.isMapLoading = false;
  }

  nextImage() {
    if (this.propertyDetails && this.propertyDetails.images && 
        this.currentImageIndex < this.propertyDetails.images.length - 1) {
      this.currentImageIndex++;
    }
  }

  previousImage() {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
    }
  }

  // Navigation methods for the template
  navigateBack() {
    this.router.navigate(['/all-properties']);
  }
  
  navigateToLogin() {
    this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
  }

 placeOffer() {
  if (!this.isAuthenticated) {
    this.navigateToLogin();
    return;
  }

  if (!this.isBuyer) {
    this.toastService.show('Only buyers can place offers.', 'warning');
    return;
  }

  if (!this.offerPrice || this.offerPrice <= 0) {
    this.offerError = 'Please enter a valid offer price.';
    return;
  }

  this.offerError = null; // Clear error if valid

  const offer = {
    propertyId: this.propertyId,
    offeredAmount: this.offerPrice
  };

  this.offerService.createOffer(offer).subscribe({
    next: (response) => {
      this.toastService.show('Offer placed successfully!', 'success');
      this.offerPrice = null;
    },
    error: (error) => {
      this.toastService.show('Failed to place offer. Please try again later.', 'error');
    }
  });
}

  async ngOnInit() {
    // Get user role and auth status
    this.authService.currentUserRole$.subscribe(role => {
      this.userRole = role;
      this.isBuyer = role === 'Buyer';
    });
    
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isAuthenticated = isLoggedIn;
    });
    
    // Get property ID from route params
    this.propertyId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.propertyId) {
      this.toastService.show('Property id not valid', 'error');     
       return;
    }
    
    // Fetch property details
    this.loadPropertyDetails();
  }
  
  loadPropertyDetails() {
    this.isLoading = true;
    
    this.propertyService.getPropertyById(this.propertyId).subscribe({
      next: (property) => {
        this.propertyDetails = property;
        this.isLoading = false;
        
        // Determine price category
        this.determinePriceCategory(300000); // Use a service to get medium price
        
        // Initialize map after loading property data
        this.initMap();
        if (this.isAuthenticated && this.isBuyer) {
          this.recordPropertyView();
        }

      },
      error: (err) => {
        this.toastService.show('Error loading property details', 'error');
        this.isLoading = false;
      }
    });
  }
  recordPropertyView() {
    const viewRequest: AddPropertyViewRequestDto = {
      propertyId: this.propertyId
    };
    
    this.propertyViewsService.addPropertyView(viewRequest).subscribe({
      next: () => {
        console.log('Property view recorded');
      },
      error: (err) => {
        console.error('Error recording property view:', err);
      }
    });}
  
  determinePriceCategory(mediumPrice: number): void {
    const { price } = this.propertyDetails;
  
    if (price < mediumPrice) {
      this.priceCategory = 'Under Medium';
    } else if (price === mediumPrice) {
      this.priceCategory = 'Medium';
    } else {
      this.priceCategory = 'Over';
    }
  }
  
  async initMap() {
    if (typeof window !== 'undefined' && this.propertyDetails) {
      try {
        const leaflet = await import('leaflet');
        L = leaflet.default || leaflet;
    
        const coordinates = {
          lat: this.propertyDetails.latitude || 0,
          lng: this.propertyDetails.longitude || 0
        };
    
        // Initialize map with marker icon
        const iconRetinaUrl = '/assets/marker-icon-2x.png';
        const iconUrl = '/assets/marker-icon.png';
        const shadowUrl = '/assets/marker-shadow.png';
        const iconDefault = L.icon({
          iconRetinaUrl,
          iconUrl,
          shadowUrl,
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          tooltipAnchor: [16, -28],
          shadowSize: [41, 41]
        });
        L.Marker.prototype.options.icon = iconDefault;
        this.map = L.map('map').setView(
          [coordinates.lat, coordinates.lng], 
          15
        );

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

        // Add marker with popup
        L.marker([coordinates.lat, coordinates.lng])
          .addTo(this.map)
          .bindPopup(`<b>${this.propertyDetails.address}</b><br>${this.propertyDetails.city}, ${this.propertyDetails.neighborhood}`)
          .openPopup();

      } catch (error) {
        console.error('Error loading map:', error);
      }
    }
  }

  toggleFavorite() {
    // Require authentication for favorites
    if (!this.isAuthenticated) {
      this.navigateToLogin();
      return;
    }
    
    this.isFavorite = !this.isFavorite;
    // TODO: Implement favorite toggle with backend service
    console.log('Toggled favorite:', this.isFavorite);
  }
  
  getPropertyTypeText(type: number): string {
    return type === 1 ? 'Apartment' : 'House';
  }
}