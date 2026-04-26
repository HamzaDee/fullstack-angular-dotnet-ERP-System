import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';

@Injectable({
  providedIn: 'root'
})
export class CRMReportsService {

  constructor(
    private readonly http: HttpClient,
    private readonly jwtAuth: JwtAuthService,
  ) { }

  public GetPotentialCustomersReportForm(): Observable<any> {
     debugger
  return this.http.get(
    `${environment.apiURL_Main}/api/CRMReports/GetPotentialCustomersReportForm/`
    + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()
  ).pipe(
    catchError(this.handleError) 
  );
}

  public GetPotentialCustomersReport(searchModel: any): Observable<any> {

    const fromDate = (searchModel?.fromDate && searchModel.fromDate !== 'undefined') ? searchModel.fromDate : '';
    const toDate = (searchModel?.toDate && searchModel.toDate !== 'undefined') ? searchModel.toDate : '';
    const sourceId = searchModel?.sourceId ?? 0;
    const status = searchModel?.status ?? 0;
    const assignedTo = searchModel?.assignedTo ?? 0;
    const branchId = searchModel?.branchId ?? 0;

    let params = new HttpParams()
      .set('FromDate', fromDate)
      .set('ToDate', toDate)
      .set('SourceId', sourceId)
      .set('Status', status)
      .set('AssignedTo', assignedTo)
      .set('branchId', branchId);

    return this.http.get(
      `${environment.apiURL_Main}/api/CRMReports/GetPotentialCustomersReport/`
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId(),
      { params }
    ).pipe(
      catchError(this.handleError)
    );
  }



  public GetPerformanceTrackingForm(): Observable<any> {
  debugger
    return this.http.get(`${environment.apiURL_Main + '/api/CRMReports/GetPerformanceTrackingForm/' + this.jwtAuth.getLang()
    + '/' + this.jwtAuth.getCompanyId()  + '/' +this.jwtAuth.getUserId() } `)
    .pipe(
      catchError(this.handleError)
    )
  }

  public GetPerformanceTrackingReport(branchId,employeeId,fromDate,toDate): Observable<any> {
  debugger
    return this.http.get(`${environment.apiURL_Main + '/api/CRMReports/GetPerformanceTrackingList/' + this.jwtAuth.getLang()
    + '/' + this.jwtAuth.getCompanyId()  + '/' + this.jwtAuth.getUserId() + '/' + branchId  + '/' +  employeeId  + '/' + fromDate  + '/' + toDate   } `)
    .pipe(
      catchError(this.handleError)
    )
  }

  public UpdateFavourite(screenId):Observable<any>
  {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      return this.http.post(`${environment.apiURL_Main + '/api/General/UpdateFavourite/'
        + screenId } `,null,httpOptions)
        .pipe(
          catchError(this.handleError)
        )
  }

  public GetFavouriteStatus(screenId)
  {
    return this.http.get(`${environment.apiURL_Main + '/api/General/GetFavouriteStatus/' + screenId } `)
    .pipe(
    catchError(this.handleError)
  )
  } 

  private handleError = (error: HttpErrorResponse) => {
    debugger;

    if (error.error instanceof ErrorEvent) {
      console.log(error.error.message);
    } else {
      console.log(error.status);
    }

    console.log('Something is wrong!');
    return throwError(() => error);
  };
}