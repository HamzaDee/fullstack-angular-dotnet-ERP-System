import { HttpHeaders, HttpErrorResponse, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { environment } from 'environments/environment';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServicePurchaseRequestListService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }

  public GetServicePurchaseRequestList(): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/ServicePurchaseRequestList/GetServicePurchaseRequestList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }


  public GetInitailServicePurchaseRequest(voucherId, opType): Observable<any> {
    if (voucherId > 0) {
      if (opType == 'Show') {
        return this.http.get(`${environment.apiURL_Main + '/api/ServicePurchaseRequestList/ShowServicePurchaseRequestForm/' + this.jwtAuth.getLang()
          + '/' + voucherId + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
          .pipe(
            catchError(this.handleError)
          )
      }
      else {
        return this.http.get(`${environment.apiURL_Main + '/api/ServicePurchaseRequestList/EditServicePurchaseRequestForm/' + this.jwtAuth.getLang()
          + '/' + voucherId + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
          .pipe(
            catchError(this.handleError)
          )
      }
    }
    else {
      return this.http.get(`${environment.apiURL_Main + '/api/ServicePurchaseRequestList/AddServicePurchaseRequestForm/' + this.jwtAuth.getLang()
        + '/' + voucherId + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
        .pipe(
          catchError(this.handleError)
        )
    }
  }

  public GetPOServiceVoucherNo(serialType, voucherTypeId, VoucherCategory, year, month): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/ServicePurchaseRequestList/GetPOServiceVoucherNo/'
      + this.jwtAuth.getCompanyId() + '/' + serialType + '/' + voucherTypeId + '/' + VoucherCategory + '/' + year + '/' + month} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public SavePurchaseRequestList(post): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/ServicePurchaseRequestList/PostPurchaseRequestListt/'
      + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `, JSON.stringify(post), httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  //delete
  public DeletePurchaseRequestList(voucherId, voucherTypeId, voucherNo): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    var urlDelete = `${environment.apiURL_Main + '/api/ServicePurchaseRequestList/DeletePurchaseRequest/' + voucherId +
       '/' + voucherTypeId + '/' + voucherNo + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`;
      return this.http.post<any>(urlDelete,'',httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

    public GetServedItems(voucherId): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/ServicePurchaseRequestList/EditItemsReservationVoucher/' + this.jwtAuth.getLang() 
        + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
        .pipe(
          catchError(this.handleError)
        )
  }


  public GetServiceInfo(Id): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/ServicePurchaseRequestList/GetServiceInfo/'
      + this.jwtAuth.getCompanyId() + '/' + Id} `)
      .pipe(
        catchError(this.handleError)
      )
  }
  

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
