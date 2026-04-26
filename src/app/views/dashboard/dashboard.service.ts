import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from "@angular/common/http";
import { environment } from "environments/environment";
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { JwtAuthService } from '../../shared/services/auth/jwt-auth.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private http: HttpClient,
    private jwtAuth: JwtAuthService,
    private translateServie: TranslateService
  ) { }
  public GetAllTodayVoucher(): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/MainDashbored/GetAllTodayVoucher/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetDashboredInfo(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/MainDashbored/GetItemSales/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetDashboredAccountBalance(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/MainDashbored/GetDashboredAccountBalance/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }


  public GetTopFiveAuthorities(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/MainDashbored/GetTopFiveAuthorities/'
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
