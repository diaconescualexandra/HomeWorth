import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  
  console.log(`Intercepting request to ${req.url}`);
  
  // Only access localStorage in browser environment
  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('jwt_token');
    console.log(`Token present: ${!!token}`);
    
    if (token) {
      console.log(`Adding auth header with token: ${token}`);
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next(authReq);
    }
    
    console.log('No token found, proceeding without auth header');
  } else {
    console.log('Running in server environment, skipping auth token');
  }
  
  // If we're on the server or no token was found, proceed without auth header
  return next(req);
};