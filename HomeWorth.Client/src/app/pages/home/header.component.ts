import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  navItems: any[] = [];
  isLoggedIn = false;
  userRole = '';
  
  constructor(private authService: AuthService) { }
  
  ngOnInit() {
    // Subscribe to auth status
    this.authService.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status;
      this.updateNavItems();
    });
    
    // Subscribe to role changes
    this.authService.currentUserRole$.subscribe(role => {
      this.userRole = role;
      this.updateNavItems();
    });
  
    
    // Initial setup
    this.isLoggedIn = this.authService.isAuthenticated();
    this.userRole = this.authService.getRole();
    this.updateNavItems();
  }
  
  updateNavItems() {
    // Common navigation items for all users
    this.navItems = [
      { label: 'Home', link: '/home' }
    ];
    
    if (this.isLoggedIn) {
      // Add logout item for all authenticated users
      this.navItems.push({ label: 'Logout', action: () => this.logout() });
      
      // Role-specific navigation items
      if (this.userRole === 'Seller') {
        this.navItems.push(
          { label: 'My Properties', link: '/my-properties' },
          { label: 'Add Property', link: '/add-property' }
        );
      } else if (this.userRole === 'Buyer') {
        this.navItems.push(
          { label: 'Browse Properties', link: '/properties' },
          { label: 'Favorites', link: '/favorites' }
        );
      } else if (this.userRole === 'Admin') {
        this.navItems.push(
          { label: 'Dashboard', link: '/admin/dashboard' },
          { label: 'User Management', link: '/admin/users' }
        );
      }
    } else {
      // Add login item for unauthenticated users
      this.navItems.push({ label: 'Login', link: '/login' });
    }
  }
  
  logout() {
    this.authService.logout();
  }
}