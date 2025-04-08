import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth-service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/Login'], { queryParams: { returnUrl: state.url } });
      return false;
    }
    
    // If route has data.roles specified, check if user has the required role
    const roles = route.data['roles'] as Array<string>;
    if (roles && roles.length > 0) {
      const userRole = this.authService.getRole();
      if (!roles.includes(userRole)) {
        // User doesn't have the required role
        this.router.navigate(['/unauthorized']);
        return false;
      }
    }
    
    // User is authenticated and has the required role (if any)
    return true;
  }
}