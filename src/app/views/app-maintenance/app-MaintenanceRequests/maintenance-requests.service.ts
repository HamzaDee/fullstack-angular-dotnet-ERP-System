import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { environment } from 'environments/environment';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceRequestsService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
    private translateServie: TranslateService) { }

  //List
  public GetMaintenanceRequestsList(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/MaintenanceRequests/GetMaintenanceRequestsList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  //get
  public GetInitailMaintenanceRequest(Id, opType): Observable<any> {
    debugger
    if (Id > 0) {
      if (opType == 'Show') {
        return this.http.get(`${environment.apiURL_Main + '/api/MaintenanceRequests/ShowMaintenanceRequests/' + this.jwtAuth.getLang()
          + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + Id} `)
          .pipe(
            catchError(this.handleError)
          )
      }
      else {
        return this.http.get(`${environment.apiURL_Main + '/api/MaintenanceRequests/EditMaintenanceRequests/' + this.jwtAuth.getLang()
          + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + Id} `)
          .pipe(
            catchError(this.handleError)
          )
      }
    }
    else {
      Id = 0;
      return this.http.get(`${environment.apiURL_Main + '/api/MaintenanceRequests/AddMaintenanceRequestsInfo/' + this.jwtAuth.getLang()
        + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + Id} `)
        .pipe(
          catchError(this.handleError)
        )
    }
  }

  getNextRequestNo(inRequest: number) {
    return this.http.get(`${environment.apiURL_Main + '/api/MaintenanceRequests/GetNextRequestNo/' + this.jwtAuth.getCompanyId() + '/' + inRequest}`)
      .pipe(
        catchError(this.handleError)
      )
  }

    CheckSerialIsExist(serialNo: string) {
    return this.http.get(`${environment.apiURL_Main + '/api/MaintenanceRequests/CheckSerialIsExist/' + this.jwtAuth.getCompanyId() + '/' + serialNo}`)
      .pipe(
        catchError(this.handleError)
      )
  }

  getDealerInfo(dealerId: number) {
    return this.http.get<any>(
      `${environment.apiURL_Main}/api/MaintenanceRequests/GetDealerInfo/${this.jwtAuth.getCompanyId()}/${dealerId}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  getSerialInfo(serialNo: string) {
    return this.http.get<any>(
      `${environment.apiURL_Main + '/api/MaintenanceRequests/GetSerialInfo/' + this.jwtAuth.getCompanyId() + '/' + serialNo}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  GetModelByItemName(itemId: string) {
    return this.http.get<any>(
      `${environment.apiURL_Main + '/api/MaintenanceRequests/GetModelByItemName/' + itemId}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  // save 
  public saveMaintenanceRequest(post): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/MaintenanceRequests/SaveMaintenanceRequest/'
      + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `, JSON.stringify(post), httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

    //Delete
    public CancelMaintenanceRequest(Id: number): Observable<any> {
      return this.http.post(
        `${environment.apiURL_Main + '/api/MaintenanceRequests/CancelMaintenanceRequest/'}`
        + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + Id,
        {}
      ).pipe(
        catchError(this.handleError)
      );
    }


      public IsValidRequestNo(requestNo, inRequest): Observable<any> {
        debugger
        return this.http.get(`${environment.apiURL_Main + '/api/MaintenanceRequests/IsValidRequestNo/'+ this.jwtAuth.getCompanyId() + '/' + requestNo + '/' + inRequest}`)
          .pipe(
            catchError(this.handleError)
          )    
      }

  public UpdateFavourite(screenId): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post(`${environment.apiURL_Main + '/api/General/UpdateFavourite/'
      + screenId + '/' + this.jwtAuth.getUserId()} `, null, httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetFavouriteStatus(screenId): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/General/GetFavouriteStatus/' + screenId + '/' + this.jwtAuth.getUserId()} `)
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
