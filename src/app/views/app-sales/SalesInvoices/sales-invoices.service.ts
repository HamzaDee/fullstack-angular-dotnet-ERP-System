
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';

@Injectable({
  providedIn: 'root'
})
export class SalesInvoicesService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }

  public GetSalesInvoiceList(voucherTypeEnum): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/SalesInvoice/SalesInvoiceList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherTypeEnum} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetSerialVoucher(serialType, voucherTypeId, VoucherCategory, year, month): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/PurchaseInvoice/GetPurchaseInvoiceVoucher/'
      + this.jwtAuth.getCompanyId() + '/' + serialType + '/' + voucherTypeId + '/' + VoucherCategory + '/' + year + '/' + month} `)
      .pipe(
        catchError(this.handleError)
      )
  }


  public GetInitailSalesInvoice(voucherId, opType, voucherTypeEnum): Observable<any> {
    debugger
    if (voucherId === undefined)
      voucherId = 0;
    if (voucherId > 0) {
      if (opType == 'Copy') {
        return this.http.get(`${environment.apiURL_Main + '/api/SalesInvoice/CopySalesInvoice/' + this.jwtAuth.getLang()
          + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId + '/' + voucherTypeEnum} `)
          .pipe(
            catchError(this.handleError)
          )
      }
      else if (opType == 'Show') {
        return this.http.get(`${environment.apiURL_Main + '/api/SalesInvoice/ShowSalesInvoiceForm/' + this.jwtAuth.getLang() + '/' + voucherId
          + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherTypeEnum} `)
          .pipe(
            catchError(this.handleError)
          )
      }
      else {
        return this.http.get(`${environment.apiURL_Main + '/api/SalesInvoice/EditSalesInvoiceFormById/' + this.jwtAuth.getLang() + '/' + voucherId
          + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherTypeEnum} `)
          .pipe(
            catchError(this.handleError)
          )
      }
    }
    else {
      return this.http.get(`${environment.apiURL_Main + '/api/SalesInvoice/AddSalesInvoiceForm/' + this.jwtAuth.getLang()
        + '/' + voucherId + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherTypeEnum} `)
        .pipe(
          catchError(this.handleError)
        )
    }
  }

  formatCurrency(value: number, decimalPlaces: number): string {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    });
  }

  public GetSalesInvoiceListBySearch(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/SalesInvoice/GetSalesInvoiceSearchList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetDealerInfo(DealerId): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/Common/GetDealerInfo/'
      + DealerId + '/' + this.jwtAuth.getCompanyId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }


  public GetQuotationsInfo(PriceOffersId): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/Quotations/GetQuotationsInfo/' + this.jwtAuth.getCompanyId() + '/' + PriceOffersId} `)
      .pipe(
        catchError(this.handleError)
      )
  }



  public GetItemsByPurchaseInvoice(Id): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/PurchaseInvoice/GetItemsByPurchaseInvoice/'
      + Id + '/' + this.jwtAuth.getCompanyId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public SaveSalesInvoice(post): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/SalesInvoice/SaveSalesInvoice/'
      + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `, JSON.stringify(post), httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetItemUnitbyItemId(id): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/General/GetUnitByItemId/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + id} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetAccounts(vouchertypeId): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/PurchaseInvoice/GetAccounts/'
      + vouchertypeId + '/' + this.jwtAuth.getCompanyId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetUnitRate(itemId, UnitId): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/General/GetUnitRate/'
      + itemId + '/' + UnitId} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public PostSalesInvoice(voucherId, voucherTypeId, voucherNo): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post(`${environment.apiURL_Main + '/api/SalesInvoice/PostSalesInvoice/'
      + voucherId + '/' + voucherTypeId + '/' + voucherNo + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `, null, httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }


  public DeleteSalesInvoice(Id, voucherTypeId, voucherNo, voucherTypeEnum): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    var urlDelete = `${environment.apiURL_Main + '/api/SalesInvoice/DeletetSalesInvoice/' + Id + '/' + voucherTypeId + '/' + voucherNo + '/' + voucherTypeEnum + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`;
    return this.http.post<any>(urlDelete, '', httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  public UpdateFavourite(screenId): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post(`${environment.apiURL_Main + '/api/General/UpdateFavourite/'
      + screenId} `, null, httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetFavouriteStatus(screenId) {
    return this.http.get(`${environment.apiURL_Main + '/api/General/GetFavouriteStatus/' + screenId} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public getSalesRequestDt(ID): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/PurchaseInvoice/GetSalesRequestDt/' + this.jwtAuth.getCompanyId() + '/' + ID}`)
      .pipe(
        catchError(this.handleError)
      )
  }


  public getDeleiveryItemsDt(ID): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/PurchaseInvoice/GetSalesInvoiceByDelieveryVoucher/' + ID + '/' + this.jwtAuth.getCompanyId()}`)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetSalesInvoiceByReservationVoucher(ID): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/SalesInvoice/GetSalesInvoiceByReservationVoucher/' + ID + '/' + this.jwtAuth.getCompanyId()}`)
      .pipe(
        catchError(this.handleError)
      )
  }


  public GetItemUintbyItemId(id): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/General/GetUnitByItemId/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + id} `)
      .pipe(
        catchError(this.handleError)
      )
  }


  public GetDeleiveryLists(id): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/PurchaseInvoice/GetDeleiveryLists/'
      + this.jwtAuth.getLang() + '/' + id + '/' + this.jwtAuth.getCompanyId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }


  public IfExistVoucher(VoucherTypeId, VoucherNo): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/SalesInvoice/CheckVoucherNo/' + this.jwtAuth.getCompanyId()
      + '/' + this.jwtAuth.getUserId() + '/' + VoucherTypeId + '/' + VoucherNo}`)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetItems(
    storeId: number,
    itemId: string,

  ): Observable<any> {
    debugger
    const lang = this.jwtAuth.getLang();
    const companyId = this.jwtAuth.getCompanyId();
    const userId = this.jwtAuth.getUserId();
    const params = new HttpParams()
      .set('StoreId', storeId)
      .set('ItemId', itemId)

    return this.http.get(`${environment.apiURL_Main}/api/InventoryVouchers/GetItemsSearch/${lang}/${companyId}/${userId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
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














































