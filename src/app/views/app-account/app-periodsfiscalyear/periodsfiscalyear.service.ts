import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';

@Injectable({
  providedIn: 'root'
})
export class PeriodsFiscalyearService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }
  public GetperiodsFiscalYearList(): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/PeriodsFiscalYear/GetPeriodsFiscalYearsList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }
  public GetperiodsfiscalYearsInitialForm(id): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/PeriodsFiscalYear/GetPeriodsFiscalYearInitailForm/' + this.jwtAuth.getLang()
      + '/' + id + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }
  /*   public PeriodsDeleteFiscalYear(id): Observable<any> {
      debugger
      var urlDelete = `${environment.apiURL_Main + '/api/PeriodsFiscalYear/DeletePeriodsFiscalYear/' + id + '/'
        + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`;
      return this.http.delete(urlDelete)
        .pipe(
          catchError(this.handleError)
        );
    } */

  /*       //delete
        public PeriodsDeleteFiscalYear(id,periodsfiscalyear): Observable<any> {
          const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
          var urlDelete = `${environment.apiURL_Main + '/api/PeriodsFiscalYear/DeletePeriodsFiscalYear/' + id +'/' + this.jwtAuth.getUserId() 
            + '/' + this.jwtAuth.getCompanyId() +'/' + periodsfiscalyear}`;
          return this.http.post<any>(urlDelete,'',httpOptions)
            .pipe(
              catchError(this.handleError)
            );
        }
     */

  public PeriodsDeleteFiscalYear(id: number, periodsfiscalyear: any): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

    const urlDelete =  `${environment.apiURL_Main + '/api/PeriodsFiscalYear/DeletePeriodsFiscalYear/' + id +'/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`;

    return this.http.post<any>(urlDelete, periodsfiscalyear, httpOptions)
      .pipe(catchError(this.handleError));
  }



  public PostPeriodsFiscalYear(post): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    debugger
    return this.http.post<any>(`${environment.apiURL_Main + '/api/PeriodsFiscalYear/PostPeriodsFiscalYear/'
      + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`, JSON.stringify(post), httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  public ValidPeriodsFiscalYear(yearId, id, startDate, endDate): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/PeriodsFiscalYear/CheckValidPeriodsFiscalYear/' + this.jwtAuth.getCompanyId()
      + '/' + yearId + '/' + id + '/' + startDate + '/' + endDate + '/' + this.jwtAuth.getLang()} `)
      .pipe(
        catchError(this.handleError)
      )
  }
  /*  int companyId, int yearId, int id, DateTime startDate, DateTime endDate */
  public UpdateFavourite(screenId): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post(`${environment.apiURL_Main + '/api/General/UpdateFavourite/'
      + screenId} `, null, httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetFavouriteStatus(screenId) {
    return this.http.get(`${environment.apiURL_Main + '/api/General/GetFavouriteStatus/' + screenId} `)
      .pipe(
        catchError(this.handleError)
      )
  }


  public CloseYearPeriod(id): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/PeriodsFiscalYear/CloseYearPeriod/' + this.jwtAuth.getCompanyId()
      + '/' + this.jwtAuth.getUserId() + '/' + id} `)
      .pipe(
        catchError(this.handleError)
      )
  }



  public OpenYearPeriod(id): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/PeriodsFiscalYear/OpenYearPeriod/' + this.jwtAuth.getCompanyId()
      + '/' + this.jwtAuth.getUserId() + '/' + id} `)
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
