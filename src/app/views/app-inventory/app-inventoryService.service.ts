import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
@Injectable({
  providedIn: 'root'
})
export class InvVoucherService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }

  public GetInvVouchersSearchList(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/InventoryVouchers/GetInvVouchersSearchList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetItemQty(itemId: number, storeId: number, unitId: number, transDate?: any, qty?: number): Observable<any> {
    debugger
    if (qty == undefined || qty == null) {
      qty = 0;
    }
    if (transDate == undefined || transDate == "") {
      transDate = null;
    }
    return this.http.get(`${environment.apiURL_Main + '/api/InventoryVouchers/GetItemsQty/'
      + this.jwtAuth.getCompanyId() + '/' + itemId + '/' + storeId + '/' + unitId + '/' + transDate + '/' + qty} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetItemSerials(itemId: number, storeId: number) {
    return this.http.get(`${environment.apiURL_Main + '/api/InventoryVouchers/GetItemsSerials/'
      + itemId + '/' + storeId} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetSerialVoucher(serialType, voucherTypeId, VoucherCategory, year, month): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/InventoryVouchers/GetInvSerialVoucher/'
      + this.jwtAuth.getCompanyId() + '/' + serialType + '/' + voucherTypeId + '/' + VoucherCategory + '/' + year + '/' + month} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public IfExistVoucher(VoucherTypeId, VoucherNo): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/InventoryVouchers/CheckVoucherNo/' + this.jwtAuth.getCompanyId()
      + '/' + this.jwtAuth.getUserId() + '/' + VoucherTypeId + '/' + VoucherNo}`)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetUnitRate(itemId, UnitId): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/General/GetUnitRate/'
      + itemId + '/' + UnitId} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetItemAllSerials(itemId: number) {
    return this.http.get(`${environment.apiURL_Main + '/api/InventoryVouchers/GetItemAllSerials/'
      + itemId} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public AllowAddSerial(SerialNo: String, ItemId: number) {
    return this.http.get(`${environment.apiURL_Main + '/api/InventoryVouchers/GetAllowAddSerial/'
      + SerialNo + '/' + ItemId} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public getItemQtyFromStore(itemId: number, unitId: number, qty: number, storeId: number): Observable<any> {
    debugger
    if (qty == undefined || qty == null) {
      qty = 0;
    }
    return this.http.get(`${environment.apiURL_Main + '/api/OutputVoucherH/GetItemQtyFromStore/'
      + this.jwtAuth.getCompanyId() + '/' + itemId + '/' + unitId + '/' + qty + '/' + storeId}`)
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