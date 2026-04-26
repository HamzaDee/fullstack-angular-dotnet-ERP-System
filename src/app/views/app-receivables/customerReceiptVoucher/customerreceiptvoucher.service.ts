import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { DropDownModel } from 'app/shared/models/DropDownModel';
@Injectable({
  providedIn: 'root'
})
export class CustomerReceiptvoucherService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }

  public GetCustReceiptVoucherList(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/CustomerReceiptVoucher/CustomerReceiptVoucherList/'
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

  public SaveCustReceiptVoucher(post): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/CustomerReceiptVoucher/SaveCustomerReceiptVoucher/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,JSON.stringify(post),httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  public PostCustReceiptVoucher(voucherId): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    var urlDelete = `${environment.apiURL_Main + '/api/CustomerReceiptVoucher/PostCustomerReceiptVoucher/' + voucherId +'/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`;
    return this.http.post<any>(urlDelete,'',httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }


  public DeleteCustReceiptVoucher(voucherId): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    var urlDelete = `${environment.apiURL_Main + '/api/CustomerReceiptVoucher/DeleteCustomerReceiptVoucher/' + voucherId +'/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`;
    return this.http.post<any>(urlDelete,'',httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  public GetSerialVoucher(serialType, voucherTypeId, VoucherCategory, year, month): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/EntryVouchers/GetSerialVoucher/'
      + this.jwtAuth.getCompanyId() + '/' + serialType + '/' + voucherTypeId + '/' + VoucherCategory + '/' + year + '/' + month} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetInitailCustReceiptVoucher(voucherId, opType): Observable<any> {
    if(voucherId > 0){
      if(opType == 'Copy'){
        return this.http.get(`${environment.apiURL_Main + '/api/CustomerReceiptVoucher/CopyCustomerReceiptVoucher/' + this.jwtAuth.getLang() 
        + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
        .pipe(
          catchError(this.handleError)
        )
      }
      else if(opType == 'Reverse'){
        return this.http.get(`${environment.apiURL_Main + '/api/CustomerReceiptVoucher/ReverseCustomerReceiptVoucher/' + this.jwtAuth.getLang() 
        + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
        .pipe(
          catchError(this.handleError)
        )
      }
                        else if (opType == 'Show') {
        return this.http.get(`${environment.apiURL_Main + '/api/CustomerReceiptVoucher/ShowCustomerReceiptVoucher/' + this.jwtAuth.getLang()
          + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
          .pipe(
            catchError(this.handleError)
          )
      }
      else{
        return this.http.get(`${environment.apiURL_Main + '/api/CustomerReceiptVoucher/EditCustomerReceiptVoucher/' + this.jwtAuth.getLang() 
        + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
        .pipe(
          catchError(this.handleError)
        )
      }
    }
    else{
      return this.http.get(`${environment.apiURL_Main + '/api/CustomerReceiptVoucher/AddCustomerReceiptVoucher/' + this.jwtAuth.getLang() 
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
        .pipe(
          catchError(this.handleError)
        )
    }   
  }

  public GetValidVoucherNo(VoucherNo, VoucherTypeId): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/CustomerReceiptVoucher/IsValidVoucherNo/' + this.jwtAuth.getCompanyId() + '/' + VoucherNo + '/' + VoucherTypeId}`)
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
  
  public UpdateFavourite(screenId):Observable<any>
  {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      return this.http.post(`${environment.apiURL_Main + '/api/General/UpdateFavourite/'
        + screenId } `,null,httpOptions)
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

  public GetFavouriteStatus(screenId)
  {
    return this.http.get(`${environment.apiURL_Main + '/api/General/GetFavouriteStatus/' + screenId  } `)
    .pipe(
      catchError(this.handleError)
    )
  }


  public CheckDeleteStatus(voucherId,chqId)
  {
    return this.http.get(`${environment.apiURL_Main + '/api/General/CheckValidDelete/' + voucherId + '/' + chqId} `)
    .pipe(
      catchError(this.handleError)
    )
  }
  

  public GetPaymentBills(DealerId): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/CustomerReceiptVoucher/GetPaymentBills/' + DealerId + '/' + this.jwtAuth.getLang()} `)
    .pipe(
      catchError(this.handleError)
    )
  }
  

   public GetHisVouchers(PaymentTypeId): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/IntAccounting/GetHisVouchers/' + PaymentTypeId + '/' + this.jwtAuth.getLang()} `)
    .pipe(
      catchError(this.handleError)
    )
  }

  updatePayerName(id: number, name: string): Observable<boolean> {
    const lang = this.jwtAuth.getLang();
    const companyId = this.jwtAuth.getCompanyId();
    const userId = this.jwtAuth.getUserId();

    const encodedName = encodeURIComponent(name || ' '); 

    const url = `${environment.apiURL_Main}/api/CustomerReceiptVoucher/UpdatePayerName/${lang}/${companyId}/${userId}/${id}/${encodedName}`;

    return this.http.post<boolean>(url, {});
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
