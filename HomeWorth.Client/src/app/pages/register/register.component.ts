import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors
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
        password: ['', [Validators.required, this.passwordValidator]],
        phoneNumber: ['', [Validators.required, this.phoneNumberValidator]],
        FirstName: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],
        LastName: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],
      });
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  phoneNumberValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    
    const phonePattern = /^\d{10}$/;
    return phonePattern.test(value) ? null : { phoneNumber: true };
  }

  // Custom validator for password with all requirements
  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const errors: ValidationErrors = {};

    // Minimum length of 10
    if (value.length < 10) {
      errors['minLength'] = true;
    }

    // Require digit
    if (!/\d/.test(value)) {
      errors['requireDigit'] = true;
    }

    // Require lowercase
    if (!/[a-z]/.test(value)) {
      errors['requireLowercase'] = true;
    }

    // Require uppercase
    if (!/[A-Z]/.test(value)) {
      errors['requireUppercase'] = true;
    }

    // Require non-alphanumeric character
    if (!/[^a-zA-Z0-9]/.test(value)) {
      errors['requireNonAlphanumeric'] = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
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


