import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { HomeService } from './services/home.service';
import { CommonModule } from '@angular/common';
import { Router } from 'express';

@Component({
  selector: 'app-root',
  imports: [CommonModule,RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  // title = 'HomeWorth.Client';
  // homeMessage: string = ''; // Variable to hold the API response

  // homeService = inject(HomeService);

  // ngOnInit(): void {
  //   this.homeService.get().subscribe(
  //     (response) => {
  //       this.homeMessage = response.message;  // Get message from response
  //     }
  //   );
  // }
}