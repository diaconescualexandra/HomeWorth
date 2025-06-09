import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">Welcome to HomeWorth</h1>
      <p>Find your dream property or list your property for sale.</p>
    </div>
  `
})
export class HomeComponent {}