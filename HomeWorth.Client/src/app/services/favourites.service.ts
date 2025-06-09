import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AddFavouriteRequestDto } from '../models/add-favourite-request-dto.model';
import { PropertyResponseDto } from '../models/property-response-dto.model';
import { PagedResult } from '../models/paged-result-model-dto.model';

@Injectable({
  providedIn: 'root'
})
export class FavouritesService {

   private apiUrl = `${environment.apiURL}/api/Favourites`;
  
    constructor(private http: HttpClient) { }

    getBuyersFavourites(pageNumber: number = 1, pageSize: number = 10): Observable<PagedResult<PropertyResponseDto>> {
      return this.http.get<PagedResult<PropertyResponseDto>>(`${this.apiUrl}/user?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    }

    addToFavourites(addFavouriteDto: AddFavouriteRequestDto): Observable<any> {
      return this.http.post(`${this.apiUrl}`, addFavouriteDto);
    }

    removeFromFavourites(propertyId: string): Observable<any> {
      return this.http.delete(`${this.apiUrl}/remove-by-property/${propertyId}`);
    }
}
