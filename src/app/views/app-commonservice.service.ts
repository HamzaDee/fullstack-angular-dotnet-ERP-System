import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from "environments/environment";
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { catchError } from 'rxjs/operators';
import {Observable,  throwError } from 'rxjs';
import { formatNumber } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppCommonserviceService {
  private favouriteRefresh$ = new BehaviorSubject<void>(undefined);
  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }

  greaterThanZeroValidator(control: any) {
    const value = parseFloat(control.value);
    if (isNaN(value) || value <= 0) {
      return { invalidValue: true };
    }
    return null; // Validation passed
  }

  isValidNumber(value) {
    if (isNaN(value) || value <= 0) {
      return false;
    }
    return true; 
  }

  formatCurrencyNumber = function(Amt, decimalPlaces: number = 3){
    return parseFloat(Amt).toFixed(decimalPlaces).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
  };  
  
  parseAmount(value: any): number {
    if (!value) return 0;
    return Number(value.toString().replace(/,/g, ''));
  }

  formatCurrency(value: number, decimalPlaces: number): string {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    });
  }
  
  public isValidVoucherDate(input) {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/Common/ValidDateVoucher/'
      + this.jwtAuth.getCompanyId() + '/' + input} `)
      .pipe(
        catchError(this.handleError)
      )
    // var VoucherDate = $("#VoucherDate").val();
    // $.ajax({
    //     async: false,
    //     type: 'GET',
    //     url: '/Accounting/FiscalYear/ValidDateVoucher',
    //     data: { voucherDate: VoucherDate }
    // }).done(function (data) {
    //         if (data == "True") {
    //             $('.msgVoucherDate').html('');
    //             if ($('#Id').val() == 0) {
    //                 var serialByMonth = $(".ddlVoucherType option:selected").data("serialbymonth");
    //                 if (serialByMonth == 'True' && option != 'save') {
    //                     getVoucherNo();
    //                 }
    //             }
    //             return true;
    //         } else {
    //             $('.msgVoucherDate').html(notValidDate);
    //             return false;
    //         }
    // });
  }

  public UpdateFavourite(screenId):Observable<any>
    {
      const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
        return this.http.post(`${environment.apiURL_Main + '/api/General/UpdateFavourite/'
          + screenId + '/' + this.jwtAuth.getUserId() } `,null,httpOptions)
          .pipe(
            catchError(this.handleError)
          )
    }
    

    public GetFavouriteStatus (screenId):Observable<any>
    {
      return this.http.get(`${environment.apiURL_Main + '/api/General/GetFavouriteStatus/' + screenId + '/' + this.jwtAuth.getUserId() } `)
      .pipe(
        catchError(this.handleError)
      )
    }


  getFavouriteRefresh() {
    return this.favouriteRefresh$.asObservable();
  }

   triggerFavouriteRefresh() {
    this.favouriteRefresh$.next();
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
