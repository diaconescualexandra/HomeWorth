import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { NotificationService, Notification, NotificationType } from '../../services/notification.service';
import { AuthService } from '../../services/auth-service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification',
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css'
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  showPanel = false;
  userId: string | null = null;
  unreadCount = 0;
  private subscriptions: Subscription[] = [];
  private isLoading = false;

  // Make enum available in template
  NotificationType = NotificationType;

  constructor(
    private notificationService: NotificationService, 
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Wait for authentication to be ready
    const authSub = this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.userId = this.authService.getUserId();
        if (this.userId) {
          this.loadNotifications();
        }
      } else {
        // Clear notifications when user logs out
        this.notifications = [];
        this.unreadCount = 0;
        this.userId = null;
      }
    });
    this.subscriptions.push(authSub);

    // Listen for reload triggers from SignalR
    const reloadSub = this.notificationService.reload$.subscribe(() => {
      if (this.userId) {
        this.loadNotifications();
      }
    });
    this.subscriptions.push(reloadSub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadNotifications() {
    if (this.isLoading || !this.userId) {
      return;
    }

    console.log('Loading notifications for user:', this.userId);
    this.isLoading = true;
    
    const notificationSub = this.notificationService.getAllNotifications()
      .subscribe({
        next: (notifications) => {
          console.log('Notifications loaded successfully:', notifications);
          
          if (notifications && Array.isArray(notifications)) {
            this.notifications = notifications.sort((a, b) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            this.unreadCount = notifications.filter(notif => !notif.isRead).length;
            console.log(`Loaded ${this.notifications.length} notifications, ${this.unreadCount} unread`);
          } else {
            console.warn('Invalid notifications response:', notifications);
            this.notifications = [];
            this.unreadCount = 0;
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading notifications:', error);
          this.isLoading = false;
          
          // Handle specific error cases
          if (error.status === 401) {
            console.warn('Unauthorized - user may need to re-authenticate');
          } else if (error.status === 0) {
            console.warn('Network error - API may be unavailable');
          }
        }
      });
    
    this.subscriptions.push(notificationSub);
  }

  togglePanel() {
    this.showPanel = !this.showPanel;
    if (this.showPanel) {
      // Reload notifications when panel is opened
      this.loadNotifications();
      // Mark notifications as read after a short delay
      setTimeout(() => this.markAllAsRead(), 500);
    }
  }

  markAllAsRead() {
    const unreadNotifications = this.notifications.filter(n => !n.isRead);
    
    if (unreadNotifications.length === 0) {
      return;
    }

    // Mark all notifications as read locally first for immediate UI update
    this.notifications.forEach(n => n.isRead = true);
    this.unreadCount = 0;

    // Then update each notification on the server
    unreadNotifications.forEach(notification => {
      this.notificationService.markAsRead(notification.notificationId).subscribe({
        next: () => console.log(`Notification ${notification.notificationId} marked as read`),
        error: (error) => {
          console.error(`Error marking notification ${notification.notificationId} as read:`, error);
          // Revert the local change if server update fails
          notification.isRead = false;
          this.unreadCount = this.notifications.filter(n => !n.isRead).length;
        }
      });
    });
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.notification-bell') && this.showPanel) {
      this.showPanel = false;
    }
  }

  trackByNotificationId(index: number, notification: Notification): number {
    return notification.notificationId;
  }

  // Add method to manually refresh notifications (for debugging)
  refreshNotifications() {
    console.log('Manual refresh triggered');
    this.loadNotifications();
  }
}