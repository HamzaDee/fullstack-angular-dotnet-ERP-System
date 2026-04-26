import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';

@Injectable({
  providedIn: 'root'
})
export class serviceInvoicePurService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }

  public GetServiceInvoicePurList(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/ServicesPurchaseInv/ServicesPurchaseInvList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  formatCurrency(value: number, decimalPlaces: number): string {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    });
  }

  public SaveServicesPurchaseInv(post): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/ServicesPurchaseInv/SaveServicesPurchaseInv/'
      + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `, JSON.stringify(post), httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

 /*  public PostServicesPurchaseInv(voucherId): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.put(`${environment.apiURL_Main + '/api/ServicesPurchaseInv/PostServicesPurchaseInv/'
      + voucherId + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `, null, httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  } */

      public PostServicesPurchaseInv(voucherId): Observable<any> {
        const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
        var urlDelete = `${environment.apiURL_Main + '/api/ServicesPurchaseInv/PostServicesPurchaseInv/'  + voucherId + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() }`;
        return this.http.post<any>(urlDelete,'',httpOptions)
          .pipe(
            catchError(this.handleError)
          );
      }


  //delete
  public DeleteServicesPurchaseInv(voucherId): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    var urlDelete = `${environment.apiURL_Main + '/api/ServicesPurchaseInv/DeleteServicesPurchaseInv/' + voucherId + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`;
    return this.http.post<any>(urlDelete, '', httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }



  public GetInitailServicesPurchaseInv(voucherId, opType): Observable<any> {

    if (voucherId > 0) {
      if (opType == 'Copy') {
        return this.http.get(`${environment.apiURL_Main + '/api/ServicesPurchaseInv/CopyServicesPurchaseInv/' + this.jwtAuth.getLang()
          + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
          .pipe(
            catchError(this.handleError)
          )
      }
      else if (opType == 'Reverse') {
        return this.http.get(`${environment.apiURL_Main + '/api/ServicesPurchaseInv/ReverseServicesPurchaseInv/' + this.jwtAuth.getLang()
          + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
          .pipe(
            catchError(this.handleError)
          )
      }
                  else if (opType == 'Show') {
        return this.http.get(`${environment.apiURL_Main + '/api/ServicesPurchaseInv/ShowServicesPurchaseInv/' + this.jwtAuth.getLang()
          + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
          .pipe(
            catchError(this.handleError)
          )
      }
      else {
        return this.http.get(`${environment.apiURL_Main + '/api/ServicesPurchaseInv/EditServicesPurchaseInv/' + this.jwtAuth.getLang()
          + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
          .pipe(
            catchError(this.handleError)
          )
      }
    }
    else {
      return this.http.get(`${environment.apiURL_Main + '/api/ServicesPurchaseInv/AddServicesPurchaseInv/' + this.jwtAuth.getLang()
        + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
        .pipe(
          catchError(this.handleError)
        )
    }
  }


    public GetItemsByPurchaseOrder(Id): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/ServicesPurchaseInv/GetReceiptItemsByPurcahseOrder/'
      + Id + '/' + this.jwtAuth.getCompanyId() } `)
      .pipe(
        catchError(this.handleError)
      )    
  }



      public GetLandedCost(Id): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/ServicesPurchaseInv/GetLandedCostList/'
      + Id + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getLang()} `)
      .pipe(
        catchError(this.handleError)
      )    
  }




  
  public GetValidVoucherNo(VoucherNo, VoucherTypeId): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/ServicesPurchaseInv/IsValidVoucherNo/'+ this.jwtAuth.getCompanyId() + '/' + VoucherNo + '/' + VoucherTypeId}`)
      .pipe(
        catchError(this.handleError)
      )    
  }

  public GetSerialOpeningBalance(serialType, voucherTypeId, VoucherCategory, year, month): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/OpeningBalance/GetSerialOpeningBalance/'
      + this.jwtAuth.getCompanyId() + '/' + serialType + '/' + voucherTypeId + '/' + VoucherCategory + '/' + year + '/' + month} `)
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


  public GetServiceInfo(Id): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/ServicesPurchaseInv/GetServiceInfo/'
      + this.jwtAuth.getCompanyId() + '/' + Id} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetAccountInfo(AccountId,BranchId): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/Common/GetAccountInfo/'
      + AccountId + '/' + this.jwtAuth.getCompanyId() + '/' + BranchId} `)
      .pipe(
        catchError(this.handleError)
      )
  }
  

  public GetDealerInfo(DealerId): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/Common/GetDealerInfo/'
      + DealerId  + '/' + this.jwtAuth.getCompanyId()} `)
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
