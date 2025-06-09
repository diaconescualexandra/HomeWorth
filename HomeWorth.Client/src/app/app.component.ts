import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { HomeService } from './services/home.service';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from "./pages/home/header.component";
import { ToastComponent } from './pages/toast/toast.component';
import { SignalRService } from './services/signal-r.service';
import { AuthService } from './services/auth-service';
import { environment } from '../environments/environment.development';
import { NotificationComponent } from './pages/notification/notification.component';
import { ChangeDetectorRef } from '@angular/core';
import { filter, Subscription } from 'rxjs';
@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, HeaderComponent, ToastComponent, NotificationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  isAuthenticated = false;
  private authSubscription?: Subscription;
  private routerSubscription?: Subscription;
  
  constructor(
    private signalRService: SignalRService,
    private authService: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Subscribe to authentication status changes
    this.authSubscription = this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isAuthenticated = isLoggedIn;
      
      if (isLoggedIn) {
        // Start SignalR connection when user logs in
        this.signalRService.startConnection();
      } else {
        // Stop SignalR connection when user logs out
        this.signalRService.stopConnection();
      }
    });

    // Listen for route changes to handle login/logout navigation
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        // Force check auth status on route changes
        this.isAuthenticated = this.authService.isAuthenticated();
      });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
    this.routerSubscription?.unsubscribe();
  }
}