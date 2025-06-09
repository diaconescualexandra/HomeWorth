import { Injectable, OnDestroy } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { AuthService } from './auth-service';
import { environment } from '../../environments/environment.development';
import { ToastService } from './toast.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class SignalRService implements OnDestroy {
  private hubConnection?: signalR.HubConnection;
  private hubUrl = `${environment.apiURL.replace(/\/$/, '')}/hubs/offers`;
  private isConnected = false;

  constructor(
    private authService: AuthService, 
    private toastService: ToastService,
    private notificationService: NotificationService
  ) {}

  public startConnection(): void {
    // Don't create multiple connections
    if (this.isConnected || this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      console.log('SignalR already connected');
      return;
    }

    const token = this.authService.getToken();
    if (!token) {
      console.log('No token available for SignalR connection');
      return;
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect([0, 2000, 10000, 30000]) // Retry intervals
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Handle connection events
    this.hubConnection.onreconnecting(() => {
      console.log('SignalR reconnecting...');
      this.isConnected = false;
    });

    this.hubConnection.onreconnected(() => {
      console.log('SignalR reconnected');
      this.isConnected = true;
    });

    this.hubConnection.onclose(() => {
      console.log('SignalR connection closed');
      this.isConnected = false;
    });

    // Set up message handlers
    this.hubConnection.on('ReceiveOfferNotification', (message: string) => {
      console.log('Received offer notification:', message);
      this.notificationService.triggerReload();
    });

    this.hubConnection.on('ViewOfferNotification', (message: string) => {
      console.log('Received view offer notification:', message);
      this.notificationService.triggerReload();
    });

    // Start the connection
    this.hubConnection
      .start()
      .then(() => {
        console.log('SignalR connection established successfully');
        this.isConnected = true;
      })
      .catch(err => {
        console.error('Error establishing SignalR connection:', err);
        this.isConnected = false;
      });
  }

  public stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop()
        .then(() => {
          console.log('SignalR connection stopped');
          this.isConnected = false;
        })
        .catch(err => console.error('Error stopping SignalR connection:', err));
    }
  }

  public isConnectionActive(): boolean {
    return this.isConnected && this.hubConnection?.state === signalR.HubConnectionState.Connected;
  }

  ngOnDestroy(): void {
    this.stopConnection();
  }
}