import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, Subject, tap } from 'rxjs';
import { AuthService } from './auth-service';
import { environment } from '../../environments/environment.development';

export interface Notification {
  notificationId: number;  
  userId: string;         
  phoneNumber?: string;   
  type: NotificationType; 
  message: string;        
  createdAt: Date;        
  isRead: boolean;        
}

export enum NotificationType {
  OfferReceived = 0,      
  OfferAccepted = 1,
  OfferDeclined = 2,
  ContactShared = 3,
  OfferViewed = 4,
}
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private apiUrl = `${environment.apiURL}/api/Notifications`;
  private reloadSubject = new Subject<void>();


 public reload$ = this.reloadSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAllNotifications(): Observable<Notification[]> {
    console.log('Fetching all notifications...');
    return this.http.get<Notification[]>(`${this.apiUrl}`, { 
      headers: this.getHeaders() 
    }).pipe(
      tap(notifications => {
        console.log('Received notifications:', notifications);
      }),
      catchError(error => {
        console.error('Error fetching notifications:', error);
        throw error;
      })
    );
  }

  getUnreadNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/unread`, { 
      headers: this.getHeaders() 
    }).pipe(
      catchError(error => {
        console.error('Error fetching unread notifications:', error);
        throw error;
      })
    );
  }

  markAsRead(notificationId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/mark-read/${notificationId}`, {}, { 
      headers: this.getHeaders() 
    }).pipe(
      catchError(error => {
        console.error('Error marking notification as read:', error);
        throw error;
      })
    );
  }

  triggerReload(): void {
    this.reloadSubject.next();
  }
}