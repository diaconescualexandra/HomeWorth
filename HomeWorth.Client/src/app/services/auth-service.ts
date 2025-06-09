import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NewUserDto } from '../models/new-user-dto.model';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, distinctUntilChanged, shareReplay } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable().pipe(
    distinctUntilChanged(),
    shareReplay(1)
  );
  
  private currentUserRoleSubject = new BehaviorSubject<string>('');
  public currentUserRole$ = this.currentUserRoleSubject.asObservable().pipe(
    distinctUntilChanged(),
    shareReplay(1)
  );

  // Add cached user ID to reduce redundant decoding
  private cachedUserId: string | null = null;

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {
    this.checkAuthStatus();
  }

  private checkAuthStatus(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('jwt_token');
      const isLoggedIn = !!token;
      this.isLoggedInSubject.next(isLoggedIn);
      
      if (token) {
        this.extractAndSetUserRole(token);
      }
    } else {
      this.isLoggedInSubject.next(false);
    }
  }

  private extractAndSetUserRole(token: string): void {
    try {
      const decodedToken: any = jwtDecode(token);
      // Only log in development mode
      // if (environment.development) {
      //   console.debug('Decoded token claims:', decodedToken);
      // }
      
      // Check multiple possible claim types for role
      const role = decodedToken['role'] || 
                   decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
                   '';
      
      // Only log in development mode
      // if (environment.development) {
      //   console.debug('Extracted role:', role);
      // }
      
      // Extract and cache the user ID here
      this.cachedUserId = decodedToken['nameid'] || 
                         decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
                         null;
      
      this.currentUserRoleSubject.next(role);
    } catch (error) {
      console.error('Error decoding token:', error);
      this.currentUserRoleSubject.next('');
      this.cachedUserId = null;
    }
  }

  login(name: string, password: string): Observable<NewUserDto> {
    console.log('Attempting login for:', name);
    return this.http.post<NewUserDto>(`${environment.apiURL}/api/account/login`, { name, password }).pipe(
      tap((response) => {
        if (response && response.token) {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('jwt_token', response.token);
            this.extractAndSetUserRole(response.token);
          }
          this.isLoggedInSubject.next(true);
        }
      })
    );
  }

  getRole(): string {
    return this.currentUserRoleSubject.value;
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('jwt_token');
    }
    return null;
  }
  
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('jwt_token');
    }
    this.isLoggedInSubject.next(false);
    this.currentUserRoleSubject.next('');
    this.cachedUserId = null;
  }

  isAuthenticated(): boolean {
    return this.isLoggedInSubject.value;
  }

  register(name: string, email: string, password: string, phoneNumber:string, FirstName :string, LastName: string, role: string): Observable<NewUserDto> {
    return this.http.post<NewUserDto>(`${environment.apiURL}/api/account/register`, { name, email, password,phoneNumber,FirstName, LastName, role }).pipe(
      tap((response) => {
        if (response && response.token) {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('jwt_token', response.token);
            this.extractAndSetUserRole(response.token);
          }
          this.isLoggedInSubject.next(true);
        }
      })
    );
  }

  getUserId(): string | null {
    // Return cached user ID if available
    if (this.cachedUserId) {
      return this.cachedUserId;
    }
    
    const token = this.getToken();
    if (!token) return null;
    
    try {
      const decoded: any = jwtDecode(token);
      
      // Extract user ID
      const userId = decoded['nameid'] || 
                     decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
                     null;
      
      // Cache the result
      this.cachedUserId = userId;
      
      return userId;
    } catch (e) {
      console.error('Error extracting user ID:', e);
      return null;
    }
  }
}