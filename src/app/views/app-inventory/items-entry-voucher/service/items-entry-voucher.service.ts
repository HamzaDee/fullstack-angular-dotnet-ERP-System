import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
@Injectable({
  providedIn: 'root'
})
export class ItemsEntryVoucherService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }

  public GetInitialAdvancedSearchForm(): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/ItemsEntryVoucher/GetAdvancedSearchForm/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

/*   public DeleteItemEntryVoucher(id): Observable<any> {
    var urlDelete = `${environment.apiURL_Main + '/api/ItemsEntryVoucher/DeleteItemEntryVoucher/' + id + '/'
      + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`;
    return this.http.delete(urlDelete)
      .pipe(
        catchError(this.handleError)
      );
  } */

      public DeleteItemEntryVoucher(id): Observable<any> {
        const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
        var urlDelete = `${environment.apiURL_Main + '/api/ItemsEntryVoucher/DeleteItemEntryVoucher/' + id +'/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`;
        return this.http.post<any>(urlDelete,'',httpOptions)
          .pipe(
            catchError(this.handleError)
          );
      }

  // public PostItemEntryVoucher(post): Observable<any> {
  //   const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  //   return this.http.post<any>(`${environment.apiURL_Main + '/api/ItemsEntryVoucher/PostItemEntryVoucher/'
  //     + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`, JSON.stringify(post),httpOptions)
  //     .pipe(
  //       catchError(this.handleError)
  //     )
  // }
  public PostItemEntryVoucher(post): Observable<any> {
    return this.http.post<any>(`${environment.apiURL_Main + '/api/ItemsEntryVoucher/PostItemEntryVoucher/'
      + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`, post)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetItemEntryVoucher(id): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/ItemsEntryVoucher/ItemEntryVoucher/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + id + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public getItemEntryVoucherslist(post): Observable<any> {
    return this.http.post<any>(`${environment.apiURL_Main + '/api/ItemsEntryVoucher/ItemEntryVoucherList/' +
      this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId()}`, post)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetSerialVoucher(serialType, voucherTypeId, VoucherCategory, year, month): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/EntryVouchers/GetSerialVoucher/'
      + this.jwtAuth.getCompanyId() + '/' + serialType + '/' + voucherTypeId + '/' + VoucherCategory + '/' + year + '/' + month} `)
      .pipe(
        catchError(this.handleError)
      )
  }



  // getAllowAddSerial(items: any[]): Observable<any> {
  //   return this.http.post<any>(`${environment.apiURL_Main}/api/YourController/AllowAddSerial/${lang}/${companyId}`, items)
  //     .pipe(
  //       catchError(this.handleError)
  //     );
  


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