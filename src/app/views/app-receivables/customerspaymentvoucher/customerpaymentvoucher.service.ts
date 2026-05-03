import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerPaymentvoucherService {

  constructor(
    private readonly http: HttpClient,
    private readonly jwtAuth: JwtAuthService,
  ) { }

  public GetCustPaymentVoucherList(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/CustomerPaymentVoucher/CustomerPaymentVoucherList/'
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

  public SaveCustPaymentVoucher(post : any): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/CustomerPaymentVoucher/SaveCustomerPaymentVoucher/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,JSON.stringify(post),httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  public PostCustPaymentVoucher(voucherId: number): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    var urlDelete = `${environment.apiURL_Main + '/api/CustomerPaymentVoucher/PostCustomerPaymentVoucher/' + voucherId +'/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`;
    return this.http.post<any>(urlDelete,'',httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  public DeleteCustPaymentVoucher(voucherId: number): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    var urlDelete = `${environment.apiURL_Main + '/api/CustomerPaymentVoucher/DeleteCustomerPaymentVoucher/' + voucherId +'/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`;
    return this.http.post<any>(urlDelete,'',httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  public GetSerialVoucher(serialType: string, voucherTypeId: number, VoucherCategory: string, year: number, month: number): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/EntryVouchers/GetSerialVoucher/'
      + this.jwtAuth.getCompanyId() + '/' + serialType + '/' + voucherTypeId + '/' + VoucherCategory + '/' + year + '/' + month} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetInitailCustPaymentVoucher(voucherId: number, opType: string): Observable<any> {
    if(voucherId > 0){
      if(opType == 'Copy'){
        return this.http.get(`${environment.apiURL_Main + '/api/CustomerPaymentVoucher/CopyCustomerPaymentVoucher/' + this.jwtAuth.getLang() 
        + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
        .pipe(
          catchError(this.handleError)
        )
      }
      else if(opType == 'Reverse'){
        return this.http.get(`${environment.apiURL_Main + '/api/CustomerPaymentVoucher/ReverseCustomerPaymentVoucher/' + this.jwtAuth.getLang() 
        + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
        .pipe(
          catchError(this.handleError)
        )
      }
                        else if (opType == 'Show') {
        return this.http.get(`${environment.apiURL_Main + '/api/CustomerPaymentVoucher/ShowCustomerPaymentVoucher/' + this.jwtAuth.getLang()
          + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
          .pipe(
            catchError(this.handleError)
          )
      }
      else{
        return this.http.get(`${environment.apiURL_Main + '/api/CustomerPaymentVoucher/EditCustomerPaymentVoucher/' + this.jwtAuth.getLang() 
        + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
        .pipe(
          catchError(this.handleError)
        )
      }
    }
    else{
      return this.http.get(`${environment.apiURL_Main + '/api/CustomerPaymentVoucher/AddCustomerPaymentVoucher/' + this.jwtAuth.getLang() 
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
        .pipe(
          catchError(this.handleError)
        )
    }   
  }


  public GetValidVoucherNo(VoucherNo: string, VoucherTypeId: number): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/CustomerPaymentVoucher/IsValidVoucherNo/' + this.jwtAuth.getCompanyId() + '/' + VoucherNo + '/' + VoucherTypeId}`)
      .pipe(
        catchError(this.handleError)
      )    
  }


  public GetPaymentBills(DealerId: number): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/CustomerReceiptVoucher/GetPaymentBills/' + DealerId + '/' + this.jwtAuth.getLang()} `)
    .pipe(
      catchError(this.handleError)
    )
  }

  public GetDealerInfo(DealerId: number): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/Common/GetDealerInfo/'
      + DealerId  + '/' + this.jwtAuth.getCompanyId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }


  public UpdateFavourite(screenId: number):Observable<any>
  {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      return this.http.post(`${environment.apiURL_Main + '/api/General/UpdateFavourite/'
        + screenId } `,null,httpOptions)
        .pipe(
          catchError(this.handleError)
        )
  }
  
  public GetFavouriteStatus(screenId: number)
  {
    return this.http.get(`${environment.apiURL_Main + '/api/General/GetFavouriteStatus/' + screenId  } `)
    .pipe(
      catchError(this.handleError)
    )
  }


  public CheckDeleteStatus(voucherId: number, chqId: number): Observable<any>
  {
    return this.http.get(`${environment.apiURL_Main + '/api/General/CheckValidDelete/' + voucherId + '/' + chqId} `)
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
