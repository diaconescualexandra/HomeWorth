import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NewUserDto } from '../models/new-user-dto.model';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();
  
  private currentUserRoleSubject = new BehaviorSubject<string>('');
  public currentUserRole$ = this.currentUserRoleSubject.asObservable();

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
      const role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || '';
      this.currentUserRoleSubject.next(role);
    } catch (error) {
      console.error('Error decoding token:', error);
      this.currentUserRoleSubject.next('');
    }
  }

  login(name: string, password: string): Observable<NewUserDto> {
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
      const token = localStorage.getItem('jwt_token');
      console.log('Current token:', token ? `${token.substring(0, 15)}...` : 'No token found');
      return token;
    }
    return null;
  }
  
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('jwt_token');
    }
    this.isLoggedInSubject.next(false);
    this.currentUserRoleSubject.next('');
  }

  isAuthenticated(): boolean {
    return this.isLoggedInSubject.value;
  }

  register(name: string, email: string, password: string, role: string): Observable<NewUserDto> {
    return this.http.post<NewUserDto>(`${environment.apiURL}/api/account/register`, { name, email, password, role }).pipe(
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
}



