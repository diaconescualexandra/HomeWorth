import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FacilityDto } from '../models/facility-dto.model';

@Injectable({
  providedIn: 'root'
})
export class FacilityService {

  private apiUrl = `${environment.apiURL}/api/facilities`;
  
  constructor(private http: HttpClient) { }
  
  getAllFacilities(): Observable<FacilityDto[]> {
    return this.http.get<FacilityDto[]>(this.apiUrl);
  }
}
