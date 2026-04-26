import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }
  private apiUrl = environment.apiURL_Main ;

  getNotifications(): Observable<any> {
    return this.http.get(`${this.apiUrl+ '/api/notifications/GetNotifications/' + this.jwtAuth.getUserId()}`);
  }

  getAllNotifications(): Observable<any> {
    return this.http.get(`${this.apiUrl+ '/api/notifications/GetAllNotifications/' + this.jwtAuth.getUserId()}`);
  }

  markAsRead(notificationId: number): Observable<any> {
    return this.http.put(`${this.apiUrl + '/api/notifications/mark-as-read/' + notificationId}`, {});
  }
}

