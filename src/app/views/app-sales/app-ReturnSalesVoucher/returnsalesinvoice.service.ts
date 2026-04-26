
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';

@Injectable({
  providedIn: 'root'
})
export class ReturnSalesInvoicesService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }

public GetReturnSalesInvoiceList(voucherTypeEnum): Observable<any> 
  {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/ReturnSales/ReturnSalesList/'
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


  public GetInitailReturnSalesInvoice(voucherId, opType,voucherTypeEnum): Observable<any> {
    debugger
    if(voucherId > 0){
      if(opType == 'Copy'){
        return this.http.get(`${environment.apiURL_Main + '/api/ReturnSales/CopytReturnSalesInvoice/' + this.jwtAuth.getLang() 
        + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId + '/' + voucherTypeEnum} `)
        .pipe(
          catchError(this.handleError)
        )
      }
      else if(opType == 'Show'){
        return this.http.get(`${environment.apiURL_Main + '/api/ReturnSales/ShowReturnSalesInvoiceForm/' + this.jwtAuth.getLang() 
        + '/' + voucherId + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherTypeEnum} `)
        .pipe(
          catchError(this.handleError)
        )
      }
      else{
        return this.http.get(`${environment.apiURL_Main + '/api/ReturnSales/EditReturnSalesInvoiceFormById/' + this.jwtAuth.getLang() 
        + '/' + voucherId + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherTypeEnum} `)
        .pipe(
          catchError(this.handleError)
        )
      }
    }
    else{
      return this.http.get(`${environment.apiURL_Main + '/api/ReturnSales/AddReturnSalesInvoiceForm/' + this.jwtAuth.getLang() 
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

  public GetReturnSalesInvoiceListBySearch(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/PurchaseInvoice/GetPurchaseInvoiceSearchList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )    
  }

  public GetItemsBySalesInvoice(Id): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/PurchaseInvoice/GetItemsBySalesInvoice/'
      + Id + '/' + this.jwtAuth.getCompanyId() } `)
      .pipe(
        catchError(this.handleError)
      )    
  }

  public SaveReturnSalesInvoice(post): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/ReturnSales/SaveReturnSalesnvoice/'
      + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,JSON.stringify(post),httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetItemUnitbyItemId(id): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/General/GetUnitByItemId/'
      + this.jwtAuth.getLang()  + '/' + this.jwtAuth.getCompanyId() + '/' + id} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetAccounts(vouchertypeId): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/PurchaseInvoice/GetAccounts/'
      + vouchertypeId  + '/' + this.jwtAuth.getCompanyId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetUnitRate(itemId , UnitId): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/General/GetUnitRate/'
      + itemId  + '/' + UnitId} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public PostReturnSalesInvoice(voucherId,voucherTypeId,voucherNo): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post(`${environment.apiURL_Main + '/api/ReturnSales/PostReturnSalesInvoice/'
      + voucherId + '/' + voucherTypeId + '/' + voucherNo + '/' +this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,null,httpOptions)
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

  public DeleteReturnSalesInvoice(Id,voucherTypeId,voucherNo,voucherTypeEnum): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    var urlDelete = `${environment.apiURL_Main + '/api/ReturnSales/DeletetReturnSalesInvoice/' + Id + '/' + voucherTypeId + '/' + voucherNo + '/' + voucherTypeEnum + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`;
    return this.http.post<any>(urlDelete,'',httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }





  public GetAllowEditBatch(BatchNo,ItemId)
  {
    return this.http.get(`${environment.apiURL_Main + '/api/PurchaseInvoice/GetAllowEditBatchExpiry/' + BatchNo + '/' + ItemId}`)
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
  return this.http.get(`${environment.apiURL_Main + '/api/General/GetFavouriteStatus/' + screenId } `)
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














































