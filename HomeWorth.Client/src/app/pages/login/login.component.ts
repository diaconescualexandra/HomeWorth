import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { NewUserDto } from '../../models/new-user-dto.model';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  standalone: true
})

export class LoginComponent {

  loginForm: FormGroup;
  errorMessage: string | null = null;

  showPassword: boolean = false;


  constructor(
    private fb: FormBuilder, 
    private authService: AuthService,
    private router: Router
  ) 
  {
    this.loginForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(5)]],
    });

    this.loginForm.get('password')?.valueChanges.subscribe(() => {
    this.errorMessage = null;
  });
  }
  
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  
  login(formValues: { name: string, password: string }){
    if(this.loginForm.valid){
      this.authService.login(formValues.name.toLowerCase(), formValues.password).subscribe(
        result => {
          console.log('Login successful:', result);
          if(this.authService.getRole() === 'Seller'){
            this.router.navigate(['my-properties']);
          } else if(this.authService.getRole() === 'Buyer'){
            this.router.navigate(['all-properties']);
          } 
          // Check if token is available after login
          const token = this.authService.getToken();
          console.log('Token after login:', token ? 'Token is present' : 'Token is missing');
          
          this.loginForm.reset();
          // Use router navigation instead of page reload
          this.router.navigate(['home']); // Navigate to home or dashboard
        }, 
        error => {
          console.log('Login failed:', error);
          this.errorMessage = 'Incorrect username or password';
        }
      ); 
    } else {
          this.errorMessage = null ;}
  }
}