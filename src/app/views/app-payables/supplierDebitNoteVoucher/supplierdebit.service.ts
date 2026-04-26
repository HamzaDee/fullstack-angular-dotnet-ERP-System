import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';

@Injectable({
  providedIn: 'root'
})
export class SuppDebitNoteVoucherService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }

  public GetSuppDebitNoteVoucherList(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/SupplierDepitNoteVoucher/SupplierDepitNoteVoucherList/'
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

  public SaveSuppDebitNoteVoucher(post): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/SupplierDepitNoteVoucher/SaveSupplierDepitNoteVoucher/'
      + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,JSON.stringify(post),httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

/*   public PostSuppDebitNoteVoucher(voucherId): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.put(`${environment.apiURL_Main + '/api/SupplierDepitNoteVoucher/PostSupplierDepitNoteVoucher/'
      + voucherId + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,null,httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  } */

      public PostSuppDebitNoteVoucher(voucherId): Observable<any> {
        const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
        var urlDelete = `${environment.apiURL_Main + '/api/SupplierDepitNoteVoucher/PostSupplierDepitNoteVoucher/' + voucherId + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() }`;
        return this.http.post<any>(urlDelete,'',httpOptions)
          .pipe(
            catchError(this.handleError)
          );
      }

/*   public DeleteSuppDebitNoteVoucher(voucherId): Observable<any> {
    debugger    
    return this.http.delete(`${environment.apiURL_Main + '/api/SupplierDepitNoteVoucher/DeleteSupplierDepitNoteVoucher/'
      + voucherId + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  } */

  
     //delete
     public DeleteSuppDebitNoteVoucher(voucherId): Observable<any> {
      const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      var urlDelete = `${environment.apiURL_Main + '/api/SupplierDepitNoteVoucher/DeleteSupplierDepitNoteVoucher/' + voucherId +'/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`;
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

  public GetInitailSuppDebitNoteVoucher(voucherId, opType): Observable<any> {
    if(voucherId > 0){
      if(opType == 'Copy'){
        return this.http.get(`${environment.apiURL_Main + '/api/SupplierDepitNoteVoucher/CopySupplierDepitNoteVoucher/' + this.jwtAuth.getLang() 
        + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
        .pipe(
          catchError(this.handleError)
        )
      }
      else if(opType == 'Reverse'){
        return this.http.get(`${environment.apiURL_Main + '/api/SupplierDepitNoteVoucher/ReverseSupplierDepitNoteVoucher/' + this.jwtAuth.getLang() 
        + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
        .pipe(
          catchError(this.handleError)
        )
      }
                  else if (opType == 'Show') {
        return this.http.get(`${environment.apiURL_Main + '/api/SupplierDepitNoteVoucher/ShowSupplierDepitNoteVoucher/' + this.jwtAuth.getLang()
          + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
          .pipe(
            catchError(this.handleError)
          )
      }
      else{
        return this.http.get(`${environment.apiURL_Main + '/api/SupplierDepitNoteVoucher/EditSupplierDepitNoteVoucher/' + this.jwtAuth.getLang() 
        + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
        .pipe(
          catchError(this.handleError)
        )
      }
    }
    else{
      return this.http.get(`${environment.apiURL_Main + '/api/SupplierDepitNoteVoucher/AddSupplierDepitNoteVoucher/' + this.jwtAuth.getLang() 
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
        .pipe(
          catchError(this.handleError)
        )
    }   
  }

  public GetValidVoucherNo(VoucherNo, VoucherTypeId): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/SupplierDepitNoteVoucher/IsValidVoucherNo/' + this.jwtAuth.getCompanyId() + '/' + VoucherNo + '/' + VoucherTypeId}`)
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


  public CheckDeleteStatus(voucherId,chqId)
  {
    return this.http.get(`${environment.apiURL_Main + '/api/General/CheckValidDelete/' + voucherId + '/' + chqId} `)
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
