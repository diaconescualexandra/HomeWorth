import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  standalone: true
})

export class LoginComponent {

  loginForm: FormGroup;
  constructor(private fb: FormBuilder) {
      {
        this.loginForm = this.fb.group({
          email: ['', [Validators.required, Validators.email]],
          password: ['', [Validators.required, Validators.minLength(10)]],
        });
      }
    }
  
    //TODO: password validators same as backend
    onSubmit(): void {
      if (this.loginForm.valid) {
        console.log('Form Data:', this.loginForm.value); // Form values on submission
      } else {
        console.log('Form is invalid.');
      }
    }
}
