import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
@Injectable({
  providedIn: 'root'
})
export class GeneralSettingsService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }
  public GetAccountingSystemForm(): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/GeneralSettings/GetAccountingSystemForm/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() } `)
      .pipe(
        catchError(this.handleError)
      )
  }
  public GetStoresForm(): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/GeneralSettings/GetStoresForm/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }
  public AddGeneralSettings(post): Observable<any> {
    return this.http.post<any>(`${environment.apiURL_Main + '/api/GeneralSettings/AddGeneralSettings/' +
      this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`, post)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetItemEntryVoucerSettings(): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/GeneralSettings/GetItemEntryVoucerSettings/'
      + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }


  public CheckIsDefaultCurrency(currencyId): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/GeneralSettings/CheckIsDefaultCurrency/'
      + currencyId  + '/' + this.jwtAuth.getCompanyId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }
  

  public GetEmailInfoForm(): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/GeneralSettings/GetEmailForm/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }
  
  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.log(error.error.message)
    } else {
      console.log(error.status)
    }
    return throwError(
      console.log('Something is wrong!'));
  }
}
