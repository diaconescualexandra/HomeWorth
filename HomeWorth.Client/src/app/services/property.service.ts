import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PropertyRequestDto } from '../models/property-request-dto.model';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { UpdatePropertyRequestDto } from '../models/update-property-request-dto.model';
import { PropertyType } from '../models/property-type.enum';
import { PropertyResponseDto, PropertyStatus } from '../models/property-response-dto.model';
import { PagedResult } from '../models/paged-result-model-dto.model';

export interface PropertyQueryObject{
  SearchTerm?: string ;
  PropertyType?: PropertyType;
  noOfRooms?: string;
  MinPrice?: number;
  MaxPrice?: number;
  PageNumber? : number ;
  PageSize? : number;
  SortBy?: string;
  IsDescending? : boolean;
  ExcludeGroundFloor?: boolean;
  ExcludeTopFloor?: boolean;
  Status?: PropertyStatus;
  IncludeAllStatuses?: boolean;
}
@Injectable({
  providedIn: 'root'
})
export class PropertyService {

  private apiUrl = `${environment.apiURL}/api/properties`;

  constructor(private http: HttpClient) { }

  // createProperty(property: PropertyRequestDto): Observable<any> {
  //   return this.http.post(this.apiUrl, property);
  // }

  createProperty(property: PropertyRequestDto): Observable<any> {
  return this.http.post(this.apiUrl, property, { observe: 'response' });
  }

  updateProperty(propertyId: string, property: UpdatePropertyRequestDto):Observable<any>{
    return this.http.put(`${this.apiUrl}/${propertyId}`, property);
  }

  getPropertyById(propertyId: string):Observable<any>{
    return this.http.get(`${this.apiUrl}/${propertyId}`);
  }

  getAllProperties(query?: PropertyQueryObject): Observable<PagedResult<PropertyResponseDto>> {
    const params = this.buildQueryParams(query);
    return this.http.get<PagedResult<PropertyResponseDto>>(this.apiUrl, { params });
  }

  deleteProperty(propertyId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${propertyId}`);
  }

  getMyProperties(query?: PropertyQueryObject): Observable<PagedResult<PropertyResponseDto>> {
    const params = this.buildQueryParams(query);
    return this.http.get<PagedResult<PropertyResponseDto>>(`${this.apiUrl}/my-properties`, { params });}

    private buildQueryParams(query?: PropertyQueryObject): HttpParams {
      let params = new HttpParams();
      
      if (!query) {
        return params;
      }
      
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.append(key, value.toString());
        }
      });
      
      return params;
    }

    
    updatePropertyStatus(propertyId: string, status: PropertyStatus): Observable<PropertyResponseDto> {
    return this.http.patch<PropertyResponseDto>(
        `${this.apiUrl}/${propertyId}/status`, 
        { status: status }
    );
    }
}
