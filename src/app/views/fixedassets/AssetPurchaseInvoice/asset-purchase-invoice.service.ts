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
export class AssetPurchaseInvoiceService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
    private translateServie: TranslateService) { }

 //.................. Asset Purchase Invoice

 public getAccVouchersHDList(): Observable<any> {
        
  return this.http.get(`${environment.apiURL_Main + '/api/AssetPurchaseInvoice/GetAccVouchersHDList/' +
    this.jwtAuth.getLang() + '/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`)
    .pipe(
      catchError(this.handleError)
    )
}

public GetSuppPaymentVoucherList(): Observable<any> {
  debugger
  return this.http.get(`${environment.apiURL_Main + '/api/AssetPurchaseInvoice/SupplierPaymentVoucherList/'
    + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
    .pipe(
      catchError(this.handleError)
    )
}


public GetPurchaseInvoiceListBySearch(): Observable<any> {
  debugger
  return this.http.get(`${environment.apiURL_Main + '/api/AssetPurchaseInvoice/GetPurchaseInvoiceSearchList/'
    + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
    .pipe(
      catchError(this.handleError)
    )    
}



public GetInitailAssetPurchaseInvoice(voucherId, opType): Observable<any> {
  if(voucherId > 0){
    if(opType == 'Copy'){
       return this.http.get(`${environment.apiURL_Main + '/api/AssetPurchaseInvoice/CopyAssetPurchaseInvoice/' + this.jwtAuth.getLang() 
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
      .pipe(
        catchError(this.handleError)
      ) 
    }
    else if(opType == 'Reverse'){
       return this.http.get(`${environment.apiURL_Main + '/api/EntryVouchers/ReverseEntryVoucher/' + this.jwtAuth.getLang() 
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
      .pipe(
        catchError(this.handleError)
      ) 
    }
       else if(opType == 'Show'){
        return this.http.get(`${environment.apiURL_Main + '/api/AssetPurchaseInvoice/ShowAssetPurchaseInvoice/' + this.jwtAuth.getLang() 
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
      .pipe(
        catchError(this.handleError)
      )
    }
    else{
      return this.http.get(`${environment.apiURL_Main + '/api/AssetPurchaseInvoice/EditAssetPurchaseInvoice/' + this.jwtAuth.getLang() 
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
      .pipe(
        catchError(this.handleError)
      )
    }
  }
  else{
    return this.http.get(`${environment.apiURL_Main + '/api/AssetPurchaseInvoice/GetAssetPurchaseInvoice/' + this.jwtAuth.getLang() 
    + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }   
}



public saveAssetPurchaseInvoiceForm(post): Observable<any> {
        
  const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  return this.http.post<any>(`${environment.apiURL_Main + '/api/AssetPurchaseInvoice/PostAssetPurchaseInvoice/'
    + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,JSON.stringify(post),httpOptions)
    .pipe(
      catchError(this.handleError)
    )
}

public IfExistVoucher(VoucherTypeId, VoucherNo): Observable<any> {
  return this.http.get(`${environment.apiURL_Main + '/api/AssetPurchaseInvoice/CheckVoucherNo/' + this.jwtAuth.getCompanyId() 
    + '/' + this.jwtAuth.getUserId() + '/' +  VoucherTypeId  + '/' + VoucherNo}`)
    .pipe(
      catchError(this.handleError)
    )
}

    //delete
    public deleteAssetPurchaseInvoice(id): Observable<any> {
      const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      var urlDelete = `${environment.apiURL_Main + '/api/AssetPurchaseInvoice/DeleteAssetPurchaseInvoice/' + id +'/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`;
      return this.http.post<any>(urlDelete,'',httpOptions)
        .pipe(
          catchError(this.handleError)
        );
    }


public getTaxPersantage(id): Observable<any> {
  return this.http.get(`${environment.apiURL_Main + '/api/AssetPurchaseInvoice/GetTaxPersantage/'+ id}`)
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



// ترحيل 
/* public PostServiceInvoice(voucherId): Observable<any> {
  debugger
  const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  return this.http.put(`${environment.apiURL_Main + '/api/AssetPurchaseInvoice/PostServiceInvoice/'
    + voucherId + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,null,httpOptions)
    .pipe(
      catchError(this.handleError)
    )
}
 */

public PostServiceInvoice(voucherId): Observable<any> {
  const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  var urlDelete = `${environment.apiURL_Main + '/api/AssetPurchaseInvoice/PostServiceInvoice/' + voucherId +'/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`;
  return this.http.post<any>(urlDelete,'',httpOptions)
    .pipe(
      catchError(this.handleError)
    );
}

//طباعه
public printAssetPurchaseInvoice(id): Observable<any> {
        
  return this.http.get(`${environment.apiURL_Main + '/api/AssetPurchaseInvoice/PrintAssetPurchaseInvoice/' + this.jwtAuth.getLang() + '/' + id +
    '/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()} `)
    .pipe(
      catchError(this.handleError)
    )
}



    //.................. End Asset Purchase Invoice

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
