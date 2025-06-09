import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationComponent } from '../notification/notification.component';
@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule, NotificationComponent],
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  navItems: any[] = [];
  isLoggedIn = false;
  userRole = '';
  
  //mock
  mockRoles = ['Buyer', 'Seller'];
  currentMockRole = 'Seller'; 

  constructor(private authService: AuthService) { }
  
  ngOnInit() {
  this.authService.isLoggedIn$.subscribe(status => {
    this.isLoggedIn = status;
    this.updateNavItems();
  });

  this.authService.currentUserRole$.subscribe(role => {
    this.userRole = role;
    this.updateNavItems();
  });

  // Initial setup (optional fallback)
  this.isLoggedIn = this.authService.isAuthenticated();
  this.userRole = this.authService.getRole();
  this.updateNavItems();
}
  
 // filepath: [header.component.ts](http://_vscodecontentref_/4)
updateNavItems() {
  this.navItems = [
    { label: 'Home', link: '/home' }
  ];

  if (this.isLoggedIn) {
    // Role-specific navigation items
    if (this.userRole === 'Seller') {
      this.navItems.push(
        { label: 'My Properties', link: '/my-properties' },
        { label: 'Add Property', link: '/add-property' },
        { label: 'My Offers', link: '/my-offers' }
      );
    }
    if (this.userRole === 'Buyer') {
      this.navItems.push(
        { label: 'All Properties', link: '/all-properties' },
        { label: 'Favorites', link: '/favorites' },
        { label: 'My Offers', link: '/my-offers' }
      );
    }
    if (this.userRole === 'Admin') {
      this.navItems.push(
        { label: 'Dashboard', link: '/admin-properties' },
        { label: 'User Management', link: '/admin/users' }
      );
    }
    // Add logout item for all authenticated users
    this.navItems.push({ label: 'Logout', action: () => this.logout() });
  } else {
    // Add login item for unauthenticated users
    this.navItems.push({ label: 'Login', link: '/login' });
  }
}
  
  logout() {
    this.authService.logout();
  }
}