import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyService } from '../../services/property.service';
import { PropertyCardComponent } from '../properties/property-card/property-card.component';
import { PropertyResponseDto, PropertyStatus } from '../../models/property-response-dto.model';
import { ToastService } from '../../services/toast.service';
@Component({
  selector: 'app-admin-properties',
  standalone: true,
  imports: [CommonModule, PropertyCardComponent],
  templateUrl: './admin-properties.component.html',
  styleUrls: ['./admin-properties.component.css']
})
export class AdminPropertiesComponent implements OnInit {
  properties: PropertyResponseDto[] = [];
  isLoading = true;
  error = '';
  showStatusDropdown = false;

  PropertyStatus = PropertyStatus;

  //pagination
  totalCount: number = 0; // backend needs to return this!
  page: number = 1;
  pageSize: number = 10;

  statusFilters = [
    PropertyStatus.Pending,
    PropertyStatus.Accepted,
    PropertyStatus.Rejected
  ];
    
  currentStatusFilter: PropertyStatus | undefined;

  constructor(
    private propertyService: PropertyService,
    private toastService: ToastService) {}

  ngOnInit() {
    this.loadProperties();
  }

  toggleStatusDropdown() {
    this.showStatusDropdown = !this.showStatusDropdown;
  }

   getStatusCount(status: PropertyStatus): number {
    return this.properties.filter(p => p.status === status).length;
  }

  filterByStatus(status: PropertyStatus | null) {
    this.currentStatusFilter = status ?? undefined;
    this.loadProperties();
}

  handleStatusChange(event: { propertyId: string, newStatus: PropertyStatus }) {
    this.propertyService.updatePropertyStatus(event.propertyId, event.newStatus).subscribe({
      next: () => {
        this.loadProperties();
      },
      error: (error) => {
        this.error = 'Failed to update property status';
        console.error('Error updating property status:', error);
      }
    });
  }

  loadProperties() {
    this.isLoading = true;
    this.propertyService.getAllProperties({ 
      IncludeAllStatuses: true,
      PageNumber: this.page,
      PageSize: this.pageSize,
      Status: this.currentStatusFilter,
      SortBy: 'date',
      IsDescending: true
    }).subscribe({
        next: (response) => {
          this.properties = response.data;
          this.totalCount = response.totalCount ?? 0;
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.properties = [];
          this.totalCount = 0;
          this.toastService.show("Error loading properties", 'error');
        }
      });
  }
  onPageChange(newPage: number) {
    this.page = newPage;
    this.loadProperties();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!(event.target as HTMLElement).closest('.status-dropdown')) {
      this.showStatusDropdown = false;
    }
  }
}