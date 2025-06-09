import { Component } from '@angular/core';
import { HeaderComponent } from '../../pages/home/header.component';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [HeaderComponent, RouterModule],
  template: `
    <app-header></app-header>
    <router-outlet></router-outlet>
  `
})
export class MainLayoutComponent {

}
