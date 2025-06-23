import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class EstimatePriceService {

  private fastApiUrl = 'http://127.0.0.1:8000/predict';
  private deepSeekUrl = 'https://api.deepseek.com/chat/completions';

  constructor(private http: HttpClient) {}

   estimateMelbournePrice(data: any): Observable<any> {
    return this.http.post(this.fastApiUrl, data).pipe(
      catchError(error => {
        console.error('FastAPI error:', error);
        return of({ error: 'Failed to estimate using ML model.' });
      })
    );
  }

  estimateOtherCityPrice(data: any, city: string): Observable<any> {
    const prompt = `Estimate the current market price for a ${data.Type} property with ${data.Rooms} rooms and ${data.Landsize} square meters land size, located in ${data.Suburb}, ${city}. The property is ${data.Distance}km from the city center. Provide only the estimated price in euro currency.`;

    return this.http.post(this.deepSeekUrl, {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'You are a real estate expert. Provide concise property price estimates in the local currency format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      stream: false
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-4cd667f7ca964c48ad72e56a788c2ad8'
      }
    }).pipe(
      catchError(error => {
        console.error('DeepSeek API error:', error);
        return of({ error: 'Failed to estimate using AI.' });
      })
    );
  }
}

