import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private http = inject(HttpClient);
  private apiURL = environment.apiURL + '/api/Test';

  constructor() { }

  public get(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.get<any>(this.apiURL, { headers })
      .pipe(
        catchError(error => {
          console.error('API Error:', error);
          return throwError(() => error);
        })
      );
  }
}