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
export class AsssestSalesInvoiceService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
    private translateServie: TranslateService) { }

 //.................. Asset Sales Invoice

 //Search
  public GetSuppPaymentVoucherList(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/AssetSalesInvoice/SupplierPaymentVoucherList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

//list
public assetSalesInvoiceList(): Observable<any> {
        
  return this.http.get(`${environment.apiURL_Main + '/api/AssetSalesInvoice/AssetSalesInvoiceList/' +
    this.jwtAuth.getLang() + '/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`)
    .pipe(
      catchError(this.handleError)
    )
}

//get
public GetInitailAssetSalesInvoice(voucherId, opType): Observable<any> {
  debugger
  if(voucherId > 0){
    if(opType == 'Copy'){
       return this.http.get(`${environment.apiURL_Main + '/api/AssetSalesInvoice/CopyAssetSalessInvoice/' + this.jwtAuth.getLang() 
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
      .pipe(
        catchError(this.handleError)
      ) 
    }
    else if(opType == 'Show'){
        return this.http.get(`${environment.apiURL_Main + '/api/AssetSalesInvoice/ShowAssetSalesInvoice/' + this.jwtAuth.getLang() 
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
      .pipe(
        catchError(this.handleError)
      )
    }
    else{
      return this.http.get(`${environment.apiURL_Main + '/api/AssetSalesInvoice/EditAssetSalesInvoice/' + this.jwtAuth.getLang() 
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
      .pipe(
        catchError(this.handleError)
      )
    }
  }
  else{
    return this.http.get(`${environment.apiURL_Main + '/api/AssetSalesInvoice/AddAssetSalesInvoice/' + this.jwtAuth.getLang() 
    + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }   
}

// VocherNo
public GetSerialOpeningBalance(serialType, voucherTypeId, VoucherCategory, year, month): Observable<any> {
  debugger
  return this.http.get(`${environment.apiURL_Main + '/api/OpeningBalance/GetSerialOpeningBalance/'
    + this.jwtAuth.getCompanyId() + '/' + serialType + '/' + voucherTypeId + '/' + VoucherCategory + '/' + year + '/' + month} `)
    .pipe(
      catchError(this.handleError)
    )
}


//Tax Perc
public getTaxPersantage(id): Observable<any> {
  return this.http.get(`${environment.apiURL_Main + '/api/AssetSalesInvoice/GetTaxPersantage/'+ id}`)
    .pipe(
      catchError(this.handleError)
    )
}

// save 
public saveAssetSalessInvoiceForm(post): Observable<any> {
        
  const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  return this.http.post<any>(`${environment.apiURL_Main + '/api/AssetSalesInvoice/PostAssetSalesInvoice/'
    + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,JSON.stringify(post),httpOptions)
    .pipe(
      catchError(this.handleError)
    )
}


public IfExistVoucher(VoucherTypeId, VoucherNo): Observable<any> {
  return this.http.get(`${environment.apiURL_Main + '/api/AssetSalesInvoice/CheckVoucherNo/' + this.jwtAuth.getCompanyId() 
    + '/' + this.jwtAuth.getUserId() + '/' +  VoucherTypeId  + '/' + VoucherNo}`)
    .pipe(
      catchError(this.handleError)
    )
}
public PostServiceInvoice(voucherId): Observable<any> {
  const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  var urlDelete = `${environment.apiURL_Main + '/api/AssetSalesInvoice/PostServiceInvoice/' + voucherId +'/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`;
  return this.http.post<any>(urlDelete,'',httpOptions)
    .pipe(
      catchError(this.handleError)
    );
}

/* //حذف
public deleteAssetSalesInvoice(id): Observable<any> {
  var urlDelete = `${environment.apiURL_Main + '/api/AssetSalesInvoice/deleteAssetSalesInvoice/' + id +'/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`;
  return this.http.delete(urlDelete)
    .pipe(
      catchError(this.handleError)
    );
} */

    //delete
    public deleteAssetSalesInvoice(id): Observable<any> {
      const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      var urlDelete = `${environment.apiURL_Main + '/api/AssetSalesInvoice/deleteAssetSalesInvoice/' + id +'/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`;
      return this.http.post<any>(urlDelete,'',httpOptions)
        .pipe(
          catchError(this.handleError)
        );
    }

//طباعه
public printAssetSalesInvoice(id): Observable<any> {
        
  return this.http.get(`${environment.apiURL_Main + '/api/AssetSalesInvoice/PrintAssetSsalesInvoice/' + this.jwtAuth.getLang() + '/' + id +
    '/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()} `)
    .pipe(
      catchError(this.handleError)
    )
}

//.................. End Asset Sales Invoice

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
