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
export class SalesRequestService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
    private translateServie: TranslateService) { }


 //Search
 public getSalesRequstList(): Observable<any> {
  return this.http.get(`${environment.apiURL_Main + '/api/SalesRequst/SalesRequstList/'
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

// VocherNo
public GetSerialVoucher(serialType, voucherTypeId, VoucherCategory, year, month): Observable<any> {
  
  return this.http.get(`${environment.apiURL_Main + '/api/SalesRequst/GetSalesReqVocherNo/'
    + this.jwtAuth.getCompanyId() + '/' + serialType + '/' + voucherTypeId + '/' + VoucherCategory + '/' + year + '/' + month} `)
    .pipe(
      catchError(this.handleError)
    )
}

//get
public GetInitailSalesRequest(id, opType,voucherTypeEnum): Observable<any> {
  debugger
  if(id > 0){
    if(opType == 'Copy'){

       return this.http.get(`${environment.apiURL_Main + '/api/SalesRequst/CopySalesRequest/' + this.jwtAuth.getLang() 
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id} `)
      .pipe(
        catchError(this.handleError)
      ) 
    }
   else if(opType == 'Show'){
        return this.http.get(`${environment.apiURL_Main + '/api/SalesRequst/ShowSalesRequstForm/' + this.jwtAuth.getLang()  + '/' + id
        + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()+ '/' + voucherTypeEnum} `)
        .pipe(
          catchError(this.handleError)
        )
    }
    else{
      return this.http.get(`${environment.apiURL_Main + '/api/SalesRequst/EditSalesRequstForm/' + this.jwtAuth.getLang()  + '/' + id
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()+ '/' + voucherTypeEnum} `)
        .pipe(
          catchError(this.handleError)
        )
    }
  }
  else{
    
    return this.http.get(`${environment.apiURL_Main + '/api/SalesRequst/AddSalesRequstForm/' + this.jwtAuth.getLang()  + '/' + id
    + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherTypeEnum} `)
      .pipe(
        catchError(this.handleError)
      )
  }   
}

  public getOpportunitiesInfo(Id): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/Opportunities/GetOpportunitiesInfo/' + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() 
      + '/' + this.jwtAuth.getUserId() + '/'+ Id 
    }`)
      .pipe(
        catchError(this.handleError)
      )
  }

// get Item 
public GetItemUintbyItemId(id): Observable<any> {
  return this.http.get(`${environment.apiURL_Main + '/api/General/GetUnitByItemId/'
    + this.jwtAuth.getLang()  + '/' + this.jwtAuth.getCompanyId() + '/' + id} `)
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

// get Price 
public GetPriceUnit(ItemId, UnitId): Observable<any> {
  return this.http.get(`${environment.apiURL_Main + '/api/SalesRequst/GetPriceUnit/' + ItemId + '/' + UnitId}`)
    .pipe(
      catchError(this.handleError)
    )
}


// save 
public saveSalesRequestForm(post): Observable<any> {   
  debugger   
  const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  return this.http.post<any>(`${environment.apiURL_Main + '/api/SalesRequst/PostSalesRequest/'
    + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,JSON.stringify(post),httpOptions)
    .pipe(
      catchError(this.handleError)
    )
}

// Delete
/* public deleteSalesRequest(id): Observable<any> {
  debugger    
  return this.http.delete(`${environment.apiURL_Main + '/api/SalesRequst/DeleteSsalesRequest/'
    + id + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
    .pipe(
      catchError(this.handleError)
    )
} */

    //delete
    public deleteSalesRequest(id): Observable<any> {
      const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      var urlDelete = `${environment.apiURL_Main + '/api/SalesRequst/DeleteSsalesRequest/' + id +'/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`;
      return this.http.post<any>(urlDelete,'',httpOptions)
        .pipe(
          catchError(this.handleError)
        );
    }

//طباعه
public printSalesRequest(id): Observable<any> {
        
  return this.http.get(`${environment.apiURL_Main + '/api/SalesRequst/PrintSalesRequest/' + this.jwtAuth.getLang() + '/' + id +
    '/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()} `)
    .pipe(
      catchError(this.handleError)
    )
}


public IfExistVoucher(VoucherTypeId, VoucherNo): Observable<any> {
  return this.http.get(`${environment.apiURL_Main + '/api/SalesRequst/CheckVoucherNo/' + this.jwtAuth.getCompanyId() 
    + '/' + this.jwtAuth.getUserId() + '/' +  VoucherTypeId  + '/' + VoucherNo}`)
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
      return this.http.get(`${environment.apiURL_Main + '/api/General/GetFavouriteStatus/' + screenId  } `)
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
