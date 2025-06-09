import { Component, OnInit } from '@angular/core';
import { PropertyResponseDto } from '../../../models/property-response-dto.model';
import { PropertyCardComponent } from '../property-card/property-card.component';
import { CommonModule } from '@angular/common';
import { FavouritesService } from '../../../services/favourites.service';
import { AddFavouriteRequestDto } from '../../../models/add-favourite-request-dto.model';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth-service';
import { ToastService } from '../../../services/toast.service';
@Component({
  selector: 'app-favourites',
  imports: [PropertyCardComponent, CommonModule],
  standalone: true,
  templateUrl: './favourites.component.html',
  styleUrl: './favourites.component.css'
})
export class FavouritesComponent implements OnInit {
  // Properties list
  favoriteProperties: PropertyResponseDto[] = [];
  
  // Loading and error states
  //isLoading: boolean = true;
  error: string | null = null;
  
  // Authentication and role states
  isAuthenticated: boolean = false;
  isBuyer: boolean = false;

  //pagination
  totalCount: number = 0; // backend needs to return this!
  page: number = 1;
  pageSize: number = 10;


  constructor(
    private favouritesService: FavouritesService, 
    private authService: AuthService,
    public router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    // Check authentication status
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isAuthenticated = isLoggedIn;
      
      if (!isLoggedIn) {
        this.router.navigate(['/login'], { 
          queryParams: { returnUrl: this.router.url } 
        });
        return;
      }
      
      // Check if user is a buyer
      this.authService.currentUserRole$.subscribe(role => {
        this.isBuyer = role === 'Buyer';
        
        if (!this.isBuyer) {
          this.router.navigate(['/home']);
          return;
        }
        
        // Load favorites if user is authenticated and is a buyer
        this.loadFavorites();
      });
    });
  }
  
  loadFavorites(): void {
    // this.isLoading = true;
    this.error = null;
    
    this.favouritesService.getBuyersFavourites(this.page, this.pageSize).subscribe({
      next: pagedResult => {
        this.favoriteProperties = pagedResult.data; 
        this.totalCount = pagedResult.totalCount; 
        //this.isLoading = false;
      },
      error: err => {
        this.toastService.show('Failed to load favorite properties.', 'error');
        //this.isLoading = false;
      }
    });
  }

  removeFavorite(propertyId: string): void {
    this.favouritesService.removeFromFavourites(propertyId).subscribe({
      next: () => {
        this.favoriteProperties = this.favoriteProperties.filter(
          p => p.propertyId !== propertyId
        );
      },
      error: (err) => {
        this.toastService.show('Failed to remove property from favorites.', 'error');}
    });
  }
  
  handleFavoriteToggle(event: {propertyId: string, isFavorite: boolean}): void {
    // Since we're already in favorites, we know we're removing it
    this.removeFavorite(event.propertyId);
  }
  
  onPageChange(newPage: number) {
    this.page = newPage;
    this.loadFavorites();
  }
}