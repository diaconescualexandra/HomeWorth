import { Routes, RouterModule } from '@angular/router';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { AuthGuardService } from './services/auth-guard.service';
import { HeaderComponent } from './pages/home/header.component';
import { AddPropertyComponent } from './pages/properties/add-property.component';
export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'add-property', component: AddPropertyComponent },
  
  // Seller routes
  { 
//     path: 'my-properties', 
//     //component: PropertiesComponent, 
//     canActivate: [AuthGuardService],
//     data: { roles: ['Seller'] }
//   },
//   { 
    path: 'add-property', 
    component: AddPropertyComponent, 
    canActivate: [AuthGuardService],
    data: { roles: ['Seller'] }
  },

//   // Buyer routes
//   { 
//     path: 'favorites', 
//     //component: FavoritesComponent, 
//     canActivate: [AuthGuardService],
//     data: { roles: ['Buyer'] }
//   },

//   // Admin routes
//   { 
//     path: 'admin', 
//     //loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule), 
//     canActivate: [AuthGuardService],
//     data: { roles: ['Admin'] }
//   }
];
