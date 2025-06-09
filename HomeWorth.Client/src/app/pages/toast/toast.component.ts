import { Component, OnInit } from '@angular/core';
import { ToastService, ToastType } from '../../services/toast.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-toast',
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css'
})
export class ToastComponent implements OnInit {
  message: string | null = null;
  type: ToastType = 'success';
  timeoutId: any;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.toastService.toastState$.subscribe(({ message, type }) => {
      this.message = message;
      this.type = type;
      if (this.timeoutId) clearTimeout(this.timeoutId);
      this.timeoutId = setTimeout(() => (this.message = null), 3000);
    });
  }
}