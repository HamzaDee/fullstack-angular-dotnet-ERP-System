import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { environment } from 'environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NotificationsSettingsService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
    private translateServie: TranslateService) { }
    
// get 
    public getNotificationsSettings(): Observable<any> {
      return this.http.get(`${environment.apiURL_Main + '/api/NotificationsSettings/GetNotificationsSettings/' + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() +
      '/' + this.jwtAuth.getUserId()}`)
      .pipe(
        catchError(this.handleError)
      )
    }


// save 
public saveNotificationsSettingsForm(post): Observable<any> {  
  const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  return this.http.post<any>(`${environment.apiURL_Main + '/api/NotificationsSettings/PostNotificationsSettings/'
    + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,post)
    .pipe(
      catchError(this.handleError)
    )
}
    
    
// get 
public GetVocherTypeInfo(VoucherTypeId): Observable<any> {
  return this.http.get(`${environment.apiURL_Main + '/api/NotificationsSettings/GetVocherTypeInfo/' + VoucherTypeId}`)
  .pipe(
    catchError(this.handleError)
  )
}


    private handleError(error: HttpErrorResponse) {
      debugger
      if (error.error instanceof ErrorEvent) {
          console.log(error.error.message)
      } else {
          console.log(error.status)
      }
      return throwError(
          console.log('Something is wrong!'));
  }
}
