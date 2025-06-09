import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { NewUserDto } from '../../models/new-user-dto.model';
import { Router } from '@angular/router';
import { first } from 'rxjs';
@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  standalone: true,
})
export class RegisterComponent {
  registrationForm: FormGroup;
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService, 
    private router: Router) {
    {
      this.registrationForm = this.fb.group({
        name: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(5)]],
        phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
        FirstName: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],
        LastName: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],
      });
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  registerAs(role: string) {
    if (this.registrationForm.valid) {
      const formValues = this.registrationForm.value;
      
      this.authService.register(
        formValues.name, 
        formValues.email, 
        formValues.password, 
        formValues.phoneNumber,
        formValues.FirstName,
        formValues.LastName,
        role
      ).subscribe(
        result => {
          console.log('Registration successful:', result);
          this.registrationForm.reset();  
          this.router.navigate(['/login']);  
        },
        error => {
          console.error('Registration failed:', error);
        }
      );
    } else {
      console.log('Form is invalid.');
    }
  }
  

}


