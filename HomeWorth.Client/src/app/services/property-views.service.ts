import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { AddPropertyViewRequestDto } from '../models/add-property-view-request-sto.model';
import { Observable } from 'rxjs';
import { PropertyResponseDto } from '../models/property-response-dto.model';

@Injectable({
  providedIn: 'root'
})
export class PropertyViewsService {

  private apiUrl = `${environment.apiURL}/api/PropertyViews`;
    constructor(private http: HttpClient) { }

    addPropertyView(addPropertyViewRequestDto: AddPropertyViewRequestDto): Observable<any> {
      return this.http.post(`${this.apiUrl}/add`, addPropertyViewRequestDto);
    }

    getPropertyViewCounts(propertyIds: string[]): Observable<{ [propertyId: string]: number }> {
  const idsParam = propertyIds.join(',');
  return this.http.get<{ [propertyId: string]: number }>(`${this.apiUrl}/count?ids=${idsParam}`);
}

   getMostViewdProperties(count: number): Observable<PropertyResponseDto[]> {
  return this.http.get<PropertyResponseDto[]>(`${this.apiUrl}/most-viewed/${count}`);
}
    
}
