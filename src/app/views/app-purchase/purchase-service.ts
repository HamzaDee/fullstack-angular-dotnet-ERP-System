import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }


  public GetVoucherTypeSetting(VoucherTypeId):Observable<any>
  {
    debugger
      return this.http.get(`${environment.apiURL_Main + '/api/VoucherType/GetVoucherTypeSetting/'
        + this.jwtAuth.getCompanyId() + '/' + VoucherTypeId} `)
        .pipe(
          catchError(this.handleError)
        )    
  }




  public IfExistVoucher(VoucherTypeId, VoucherNo): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/SalesInvoice/CheckVoucherNo/' + this.jwtAuth.getCompanyId() 
      + '/' + this.jwtAuth.getUserId() + '/' +  VoucherTypeId  + '/' + VoucherNo}`)
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