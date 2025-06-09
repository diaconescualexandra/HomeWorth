import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'warning';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private toastState = new Subject<{ message: string, type: ToastType }>();
  toastState$ = this.toastState.asObservable();

 show(message: string, type: ToastType = 'success') {
    this.toastState.next({ message, type });
  }
}
