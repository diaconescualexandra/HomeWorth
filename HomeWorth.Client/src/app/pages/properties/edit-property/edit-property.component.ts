import { Component, OnInit } from '@angular/core';
import { PropertyResponseDto } from '../../../models/property-response-dto.model';
import { UpdatePropertyRequestDto } from '../../../models/update-property-request-dto.model';
import { PropertyFormComponent } from '../property-form/property-form.component';
import { ActivatedRoute, Router } from '@angular/router';
import { PropertyService } from '../../../services/property.service';
import { ImageUploadService } from '../../../services/image-upload.service';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ImageRequestDto } from '../../../models/image-request-dto.model';
import { PropertyRequestDto } from '../../../models/property-request-dto.model';
import { ToastService } from '../../../services/toast.service';
// Interface to represent form data
interface PropertyFormData {
  title: string;
  description: string;
  noOfRooms: number | string;
  price: number;
  city: string;
  neighborhood: string;
  address: string;
  yearBuilt: number;
  size: number;
  latitude: number | null;
  longitude: number | null;
  propertyType: number;
  noOfFloors?: number;
  floorNo?: number;
  totalFloors?: number;
  images: Array<File | ImageRequestDto | any>; // Allow mixed types in the array
  facilityIds?: number[];
  sellerId?: string;
  distanceToCityCenter?: number;
}

@Component({
  selector: 'app-edit-property',
  standalone: true,
  imports: [PropertyFormComponent, CommonModule],
  templateUrl: './edit-property.component.html',
  styleUrls: ['./edit-property.component.css'] 
})
export class EditPropertyComponent implements OnInit {
  propertyEdit: PropertyResponseDto | null = null;
  propertyId: string | null = null;
  isLoading: boolean = true;
  errorMessage: string | null = null;
  propertyRequest: PropertyRequestDto | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private propertyService: PropertyService,
    private imageUploadService: ImageUploadService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.propertyId = this.route.snapshot.paramMap.get('id');
    
    if (!this.propertyId) {
      this.errorMessage = 'No property ID provided';
      this.isLoading = false;
      return;
    }

    this.loadProperty();
  }

  loadProperty(): void {
    if (!this.propertyId) return;

    this.isLoading = true;
    this.propertyService.getPropertyById(this.propertyId).subscribe({
      next: (property) => {
        this.propertyEdit = property;
        this.propertyRequest = {
          ...property,
          images: property.images ?? []
        };
        this.isLoading = false;
      },
      error: (error) => {
        this.toastService.show(`Error loading property`, 'error');
        this.isLoading = false;
      }
    });
  }

  updateProperty(formValue: PropertyFormData): void {
    if (!this.propertyId) {
      this.toastService.show('Property ID is missing', 'error');
      return;
    }

    // Check if we have new image files to upload
    const imagesToUpload: File[] = [];
    
    if (formValue.images && Array.isArray(formValue.images)) {
      // Find any File objects in the images array
      for (const item of formValue.images) {
        if (item instanceof File) {
          imagesToUpload.push(item);
        }
      }
    }

    if (imagesToUpload.length > 0) {
      // We have new images to upload
      this.handleImageUploads(imagesToUpload, formValue);
    } else {
      // No new images, just handle the existing ones
      this.submitUpdate(formValue);
    }
  }

  handleImageUploads(files: File[], formData: PropertyFormData): void {
    // Create an array of upload observables
    const uploadObservables = files.map(file => 
      this.imageUploadService.uploadImage(file)
    );

    forkJoin(uploadObservables).subscribe({
      next: (results) => {
        // Get URLs from the upload results
        const newImageUrls = results.map(result => result.imageUrl);
        
        // Get existing image objects from formData if any
        const existingImages: ImageRequestDto[] = [];
        
        if (formData.images && Array.isArray(formData.images)) {
          for (const img of formData.images) {
            if (!(img instanceof File) && img && typeof img === 'object' && 'imageUrl' in img) {
              existingImages.push(img as ImageRequestDto);
            }
          }
        }
        
        // Create a new images array with image objects
        const allImages: ImageRequestDto[] = [
          ...existingImages,
          ...newImageUrls.map((url: string, index: number) => ({
            imageUrl: url,
            isFirst: existingImages.length === 0 && index === 0
          }))
        ];
        
        // Update the formData with the new images array
        const updatedFormData = {
          ...formData,
          images: allImages
        };
        
        // Submit the update with the new data
        this.submitUpdate(updatedFormData);
      },
      error: (error) => {
        this.toastService.show(`Error uploading images`, 'error');
      }
    });
  }

  submitUpdate(formData: PropertyFormData): void {
    if (!this.propertyId) return;
    
    // Convert form data to the update DTO
    const updateData: UpdatePropertyRequestDto = {
      title: formData.title,
      description: formData.description,
      noOfRooms: typeof formData.noOfRooms === 'number' 
        ? formData.noOfRooms.toString() 
        : formData.noOfRooms as string,
      price: formData.price,
      city: formData.city,
      neighborhood: formData.neighborhood,
      address: formData.address,
      yearBuilt: formData.yearBuilt,
      size: formData.size,
      latitude: formData.latitude,
      longitude: formData.longitude,
      propertyType: formData.propertyType,
      noOfFloors: formData.noOfFloors,
      floorNo: formData.floorNo,
      totalFloors: formData.totalFloors,
      facilityIds: formData.facilityIds,
      distanceToCityCenter: formData.distanceToCityCenter,
    };
    
    // Handle images array specially
    if (formData.images && Array.isArray(formData.images)) {
      // Filter out File objects and keep only ImageRequestDto objects
      const imageObjects: ImageRequestDto[] = [];
      
      for (const img of formData.images) {
        if (!(img instanceof File) && img && typeof img === 'object' && 'imageUrl' in img) {
          imageObjects.push(img as ImageRequestDto);
        }
      }
      
      updateData.images = imageObjects;
    }
    
    // Send the update request
    this.propertyService.updateProperty(this.propertyId, updateData).subscribe({
      next: (response) => {
        this.toastService.show('Property updated successfully', 'success');
      },
      error: (error) => {
        this.toastService.show(`Error updating property`, 'error');
      }
    });
  }
}