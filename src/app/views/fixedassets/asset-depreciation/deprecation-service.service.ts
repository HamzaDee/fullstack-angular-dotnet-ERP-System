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
export class DeprecationServiceService {
  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
    private translateServie: TranslateService) { }
    
//.................. Fixed Asssets Deprecation 

/* //list
public getAccVouchersHDList(): Observable<any> {
        
  return this.http.get(`${environment.apiURL_Main + '/api/FixedAssetDepreciation/FixedAssetDepreciationList/' +
    this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`)
    .pipe(
      catchError(this.handleError)
    )
} */

 //Search
 public GetSuppPaymentVoucherList(): Observable<any> {
  debugger
  return this.http.get(`${environment.apiURL_Main + '/api/FixedAssetDepreciation/SupplierPaymentVoucherList/'
    + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
    .pipe(
      catchError(this.handleError)
    )
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

//get
public GetInitailAssetDeprecation(voucherId, opType): Observable<any> {
  debugger
  if(voucherId > 0){
    if(opType == 'Copy'){
       return this.http.get(`${environment.apiURL_Main + '/api/FixedAssetDepreciation/CopyAssettDeprecation/' + this.jwtAuth.getLang() 
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
      .pipe(
        catchError(this.handleError)
      ) 
    }
      else if(opType == 'Show'){
       return this.http.get(`${environment.apiURL_Main + '/api/FixedAssetDepreciation/ShowAssetDeprecation/' + this.jwtAuth.getLang() 
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
      .pipe(
        catchError(this.handleError)
      )
    }
    else{
      return this.http.get(`${environment.apiURL_Main + '/api/FixedAssetDepreciation/EditAssetDeprecation/' + this.jwtAuth.getLang() 
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
      .pipe(
        catchError(this.handleError)
      )
    }
  }
  else{
    return this.http.get(`${environment.apiURL_Main + '/api/FixedAssetDepreciation/AddAssetDepreciation/' + this.jwtAuth.getLang() 
    + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }   
}

// save 
public saveFixedAssetDeprecationForm(post): Observable<any> {  
  const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  return this.http.post<any>(`${environment.apiURL_Main + '/api/FixedAssetDepreciation/PostFixedAssetDeprecation/'
    + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,JSON.stringify(post),httpOptions)
    .pipe(
      catchError(this.handleError)
    )
}

//حذف
/* public deleteFixedAssetDepreciation(voucherId): Observable<any> {
  var urlDelete = `${environment.apiURL_Main + '/api/FixedAssetDepreciation/deleteFixedAssetDepreciation/' 
  + voucherId +'/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`;
  return this.http.delete(urlDelete)
    .pipe(
      catchError(this.handleError)
    );
} */

    //delete
    public deleteFixedAssetDepreciation(voucherId): Observable<any> {
      const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      var urlDelete = `${environment.apiURL_Main + '/api/FixedAssetDepreciation/deleteFixedAssetDepreciation/' + voucherId +'/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`;
      return this.http.post<any>(urlDelete,'',httpOptions)
        .pipe(
          catchError(this.handleError)
        );
    }


// ترحيل 
/* public PostAssetDepreciation(voucherId): Observable<any> {
  debugger
  const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  return this.http.put(`${environment.apiURL_Main + '/api/FixedAssetDepreciation/PostAssetDepreciation/'
    + voucherId + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,null,httpOptions)
    .pipe(
      catchError(this.handleError)
    )
} */

  //ترحيل
  public PostAssetDepreciation(voucherId): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    var urlDelete = `${environment.apiURL_Main + '/api/FixedAssetDepreciation/PostAssetDepreciation/' + voucherId +'/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`;
    return this.http.post<any>(urlDelete,'',httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

// GetFixedAssestListByCategory
public getFixedAssestModelListByCategory(catgId, depreciationMonth): Observable<any> {
  debugger
  return this.http.get(`${environment.apiURL_Main + '/api/FixedAssetDepreciation/GetFixedAssestListByCategory/'
  + catgId + '/' + depreciationMonth + '/'+ this.jwtAuth.getCompanyId()}`)
    .pipe(
      catchError(this.handleError)
    )
}

//طباعه
public printAssetDepreciation(id): Observable<any> {
        
  return this.http.get(`${environment.apiURL_Main + '/api/FixedAssetDepreciation/PrintAssetDepreciation/' + this.jwtAuth.getLang() + '/' + id +
    '/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()} `)
    .pipe(
      catchError(this.handleError)
    )
}

//.................. End Fixed Asssets Deprecation 

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
