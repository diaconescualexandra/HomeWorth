import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  standalone: true,
})
export class RegisterComponent {
  registrationForm: FormGroup;
  

  constructor(private fb: FormBuilder) {
    {
      this.registrationForm = this.fb.group({
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(10)]],
      });
    }
  }

  //TODO: password validators same as backend
  onSubmit(): void {
    if (this.registrationForm.valid) {
      console.log('Form Data:', this.registrationForm.value); // Form values on submission
    } else {
      console.log('Form is invalid.');
    }
  }



}
