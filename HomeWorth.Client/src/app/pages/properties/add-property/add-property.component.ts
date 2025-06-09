import { Component } from '@angular/core';
import { ReactiveFormsModule, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PropertyRequestDto } from '../../../models/property-request-dto.model';
import { PropertyFormComponent } from '../property-form/property-form.component';
import { PropertyService } from '../../../services/property.service';
import { AuthService } from '../../../services/auth-service';
import { ImageUploadService } from '../../../services/image-upload.service';
import { Observable } from 'rxjs/internal/Observable';
import { forkJoin, map } from 'rxjs';
import { Router } from '@angular/router';
import { ToastService } from '../../../services/toast.service';
@Component({
  selector: 'app-add-property',
  imports: [ReactiveFormsModule, CommonModule, PropertyFormComponent],
  templateUrl: './add-property.component.html',
  styleUrl: './add-property.component.css',
  standalone: true
})
export class AddPropertyComponent {

  showDuplicateWarning = false;
  duplicateProperty: any = null;
  duplicateWarningMessage: string = '';
  
  constructor(
    private propertyService: PropertyService,
    private authService: AuthService,
    private imageUploadService: ImageUploadService,
    private router: Router,
    private toastService: ToastService

  ) {}

  
  createProperty(formValue: PropertyRequestDto) {
    const sellerId = this.authService.getUserId();
    if (!sellerId) {
      this.toastService.show('user not autheticated', 'error');
      return;
    }
    
    // Check if we have images
    if (!formValue.images || formValue.images.length === 0) {
      this.toastService.show('Please select at least one image', 'warning');   
      return;
    }
    
    // Get files from the form
    const files = this.getFilesFromForm(formValue);
    
    // Upload all files first
    this.uploadAllImages(files).subscribe({
      next: (imageUrls) => {
        // Create image DTOs from URLs
        const imageDtos = imageUrls.map((url, index) => ({
          imageUrl: url,
          isFirst: index === 0
        }));
        
        // Create property with image URLs
        const propertyData: PropertyRequestDto = {
          ...formValue,
          sellerId,
          images: imageDtos
        };
        
        // Send the property with image URLs to the server
        
        this.propertyService.createProperty(propertyData).subscribe({
          next: (response) => {
            if (response.status === 202 && response.body?.warning) {
              // Show warning modal/toast
              this.showDuplicateWarning = true;
              this.duplicateProperty = response.body.property;
              this.duplicateWarningMessage = response.body.warning;
              // If user confirms, call createProperty again with a flag to force accept
            } else {
              this.toastService.show('Property created successfully', 'success');
              this.router.navigate(['/my-properties']);
            }
          },
          error: (error) => {
            this.toastService.show('Error creating property', 'error');
          }
        });
      },
      error: (error) => {
        this.toastService.show('Error uploading images', 'error');
      }
      
    });
  }
  
  // Helper to extract files from form
  private getFilesFromForm(formValue: any): File[] {
    return formValue.images.map((control: any) => control);
  }
  
  // Helper to upload all images
  private uploadAllImages(files: File[]): Observable<string[]> {
    // Create an array of observables for each file upload
    const uploadObservables = files.map(file => 
      this.imageUploadService.uploadImage(file)
    );
    
    // Use forkJoin to wait for all uploads to complete
    return forkJoin(uploadObservables).pipe(
      map(results => results.map(result => result.imageUrl))
    );
  }
  ngOnInit() {
    console.log('Current token:', this.authService.getToken());
    console.log('Current role:', this.authService.getRole());
    console.log('Is authenticated:', this.authService.isAuthenticated());
  }
  confirmDuplicate() {
    this.showDuplicateWarning = false;
    this.toastService.show('Your listing was submitted', 'success');
    this.router.navigate(['/my-properties']);
  }

}
