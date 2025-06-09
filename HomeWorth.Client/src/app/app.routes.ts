import { Routes, RouterModule } from '@angular/router';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { AuthGuardService } from './services/auth-guard.service';
import { HeaderComponent } from './pages/home/header.component';
import { AddPropertyComponent } from './pages/properties/add-property/add-property.component';
import { EditPropertyComponent } from './pages/properties/edit-property/edit-property.component';
import { PropertyCardComponent } from './pages/properties/property-card/property-card.component';
import { PropertyDetailsComponent } from './pages/properties/property-details/property-details.component';
import { MyPropertiesComponent } from './pages/properties/my-properties/my-properties.component';
import { FavouritesComponent } from './pages/properties/favourites/favourites.component';
import { SellersOffersComponent } from './pages/properties/sellers-offers/sellers-offers.component';
import { AllPropertiesComponent } from './pages/properties/all-properties/all-properties.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { HomeComponent } from './pages/home-component/home.component';
import { MyOffersComponent } from './pages/properties/my-offers/my-offers.component';
import { AdminPropertiesComponent } from './pages/admin-properties/admin-properties.component';
import { NotificationComponent } from './pages/notification/notification.component';

export const routes: Routes = [
  // Authentication routes - no header needed
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  // Routes with header - all inside the MainLayoutComponent
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'property-details/:id', component: PropertyDetailsComponent },
      //admin 
      {
        path: 'admin-properties',
        component: AdminPropertiesComponent,
        canActivate: [AuthGuardService],
        data: { roles: ['Admin'] }
      },
      // Seller routes
      { 
        path: 'my-properties', 
        component: MyPropertiesComponent,
        canActivate: [AuthGuardService],
        data: { roles: ['Seller'] }
      },
      { 
        path: 'add-property', 
        component: AddPropertyComponent, 
        canActivate: [AuthGuardService],
        data: { roles: ['Seller'] }
      },
      { 
        path: 'edit-property/:id', 
        component: EditPropertyComponent,
        canActivate: [AuthGuardService],
        data: { roles: ['Seller'] }
      },
      {
        path: 'my-offers',
        component: MyOffersComponent,
        canActivate: [AuthGuardService],
        data: { roles: ['Seller', 'Buyer'] }
      },
      { 
        path: 'offers/:id', 
        component: SellersOffersComponent,
        canActivate: [AuthGuardService],
        data: { roles: ['Seller'] }
      },
      {
        path: 'notifications',
        component: NotificationComponent,
        canActivate: [AuthGuardService],
        data: { roles: ['Seller', 'Buyer'] }
      },
      
      // Buyer routes
      { 
        path: 'favorites', 
        component: FavouritesComponent, 
        canActivate: [AuthGuardService],
        data: { roles: ['Buyer'] }
      },
      {
        path: 'all-properties',
        component: AllPropertiesComponent,
        canActivate: [AuthGuardService],
        data: { roles: ['Buyer'] }
      },
    ]
  },
  
  // Add a catch-all route to redirect to login or home
  { path: '**', redirectTo: '/login' }
];