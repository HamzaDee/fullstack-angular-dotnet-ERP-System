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
export class FixedAssetOperationService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
    private translateServie: TranslateService) { }

 //.................. Asset Sales Operation

 //Search
 public GetSuppPaymentVoucherList(): Observable<any> {
  return this.http.get(`${environment.apiURL_Main + '/api/FixedAssetOperation/SupplierPaymentVoucherList/'
    + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
    .pipe(
      catchError(this.handleError)
    )
}

//list
public FixedAssetOperationList(): Observable<any> {    
  return this.http.get(`${environment.apiURL_Main + '/api/FixedAssetOperation/FixedAssetOperationList/' +
    this.jwtAuth.getLang() + '/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`)
    .pipe(
      catchError(this.handleError)
    )
}

//get
public GetInitailAssetOperation(voucherId, opType): Observable<any> {
  if(voucherId > 0){
    if(opType == 'Copy'){
       return this.http.get(`${environment.apiURL_Main + '/api/FixedAssetOperation/CopyAssetOperation/' + this.jwtAuth.getLang() 
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
      .pipe(
        catchError(this.handleError)
      ) 
    }
       else if(opType == 'Show'){
     return this.http.get(`${environment.apiURL_Main + '/api/FixedAssetOperation/ShowFixedAssetOperation/' + this.jwtAuth.getLang() 
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
      .pipe(
        catchError(this.handleError)
      ) 
    }
    else{
      return this.http.get(`${environment.apiURL_Main + '/api/FixedAssetOperation/EditFixedAssetOperation/' + this.jwtAuth.getLang() 
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
      .pipe(
        catchError(this.handleError)
      )
    }
  }
  else{
    return this.http.get(`${environment.apiURL_Main + '/api/FixedAssetOperation/AddFixedAssetOperation/' + this.jwtAuth.getLang() 
    + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }   
}

// VocherNo
public GetSerialOpeningBalance(serialType, voucherTypeId, VoucherCategory, year, month): Observable<any> {
  return this.http.get(`${environment.apiURL_Main + '/api/OpeningBalance/GetSerialOpeningBalance/'
    + this.jwtAuth.getCompanyId() + '/' + serialType + '/' + voucherTypeId + '/' + VoucherCategory + '/' + year + '/' + month} `)
    .pipe(
      catchError(this.handleError)
    )
}

// GetVoucherType
public getVoucherType(id): Observable<any> {
  return this.http.get(`${environment.apiURL_Main + '/api/FixedAssetOperation/GetVoucherType/'+ id + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`)
    .pipe(
      catchError(this.handleError)
    )
}

// save 
public saveFixedAssetOperationForm(post): Observable<any> {  
  const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  return this.http.post<any>(`${environment.apiURL_Main + '/api/FixedAssetOperation/PostFixedAssetOperation/'
    + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,JSON.stringify(post),httpOptions)
    .pipe(
      catchError(this.handleError)
    )
}

public IfExistVoucher(VoucherTypeId, VoucherNo): Observable<any> {
  return this.http.get(`${environment.apiURL_Main + '/api/FixedAssetOperation/CheckVoucherNo/' + this.jwtAuth.getCompanyId() 
    + '/' + this.jwtAuth.getUserId() + '/' +  VoucherTypeId  + '/' + VoucherNo}`)
    .pipe(
      catchError(this.handleError)
    )
}
   //delete
   public deleteFixedAssetOperation(voucherId): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    var urlDelete = `${environment.apiURL_Main + '/api/FixedAssetOperation/deleteFixedAssetOperation/' + voucherId +'/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`;
    return this.http.post<any>(urlDelete,'',httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

// ترحيل 
/* public PostAssetOperation(voucherId): Observable<any> {
  debugger
  const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  return this.http.put(`${environment.apiURL_Main + '/api/FixedAssetOperation/PostAssetOperation/'
    + voucherId + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,null,httpOptions)
    .pipe(
      catchError(this.handleError)
    )
} */

public PostAssetOperation(voucherId): Observable<any> {
  const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  var urlDelete = `${environment.apiURL_Main + '/api/FixedAssetOperation/PostAssetOperation/' + voucherId +'/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`;
  return this.http.post<any>(urlDelete,'',httpOptions)
    .pipe(
      catchError(this.handleError)
    );
}

//طباعه
public printAssetOperation(id): Observable<any> {
        
  return this.http.get(`${environment.apiURL_Main + '/api/FixedAssetOperation/PrintAssetOperation/' + this.jwtAuth.getLang() + '/' + id +
    '/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()} `)
    .pipe(
      catchError(this.handleError)
    )
}


//.................. End Asset Sales Operation
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
