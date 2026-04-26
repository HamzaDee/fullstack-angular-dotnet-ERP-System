import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';

@Injectable({
  providedIn: 'root'
})
export class DeliveryStockVoucherService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }

public GetDeliveryItemsVoucherList(): Observable<any> 
  {
    return this.http.get(`${environment.apiURL_Main + '/api/ItemsdeleviryVoucher/ItemsDeleviryVoucherList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
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

  public GetInitailDeliveryItemsVoucher(voucherId, opType,voucherTypeEnum): Observable<any> {
    if(voucherId > 0){
      if(opType == 'Copy'){
        return this.http.get(`${environment.apiURL_Main + '/api/ItemsdeleviryVoucher/CopyItemsDeliveryVoucher/' + this.jwtAuth.getLang() 
        + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId + '/' + voucherTypeEnum } `)
        .pipe(
          catchError(this.handleError)
        )
      }
      else if(opType == 'Show'){
        return this.http.get(`${environment.apiURL_Main + '/api/ItemsdeleviryVoucher/ShowItemsDeliveryVoucher/' + this.jwtAuth.getLang() 
         + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()+ '/' + voucherId + '/' + voucherTypeEnum } `)
        .pipe(
          catchError(this.handleError)
        )
      }
      else{
        return this.http.get(`${environment.apiURL_Main + '/api/ItemsdeleviryVoucher/EditItemsDeliveryVoucher/' + this.jwtAuth.getLang() 
         + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()+ '/' + voucherId + '/' + voucherTypeEnum } `)
        .pipe(
          catchError(this.handleError)
        )
      }
    }
    else{
      return this.http.get(`${environment.apiURL_Main + '/api/ItemsdeleviryVoucher/AddItemsDeleviryVoucher/' + this.jwtAuth.getLang() 
       + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherTypeEnum  } `)
        .pipe(
          catchError(this.handleError)
        )
    }   
  }

  public GetItemsDeleviryVoucherSearchList(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/ItemsdeleviryVoucher/GetItemsDeleviryVoucherSearchList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )    
  }


  public SaveDeleviryItemsVoucher(post): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/ItemsdeleviryVoucher/SaveItemsDeliveryVoucher/'
      + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,JSON.stringify(post),httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetItemUnitbyItemId(id): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/General/GetUnitByItemId/'
      + this.jwtAuth.getLang()  + '/' + this.jwtAuth.getCompanyId() + '/' + id} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetAccounts(vouchertypeId): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/PurchaseInvoice/GetAccounts/'
      + vouchertypeId  + '/' + this.jwtAuth.getCompanyId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetUnitRate(itemId , UnitId): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/General/GetUnitRate/'
      + itemId  + '/' + UnitId} `)
      .pipe(
        catchError(this.handleError)
      )
  }




  public DeleteDeleviryItemsVoucher(voucherId): Observable<any> {
    debugger    
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post(`${environment.apiURL_Main + '/api/ItemsdeleviryVoucher/DeleteDeliveryVoucher/'
      + voucherId + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }


  

  public GetItemsBySalesInvoice(Id): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/ReceiptItemsVoucher/GetReceiptItemsByPurcahseInvoice/'
      + Id + '/' + this.jwtAuth.getCompanyId() } `)
      .pipe(
        catchError(this.handleError)
      )    
  }


  public GetItemsBySalesOrder(Id): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/ItemsdeleviryVoucher/GetDeleviryItemsBySalesOrder/'
      + Id + '/' + this.jwtAuth.getCompanyId() } `)
      .pipe(
        catchError(this.handleError)
      )    
  }



  public GetMainQtySalesOrder(id,itemId): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/ItemsdeleviryVoucher/GetMainQtySalesOrder/'
      + id + '/' + itemId + '/' + this.jwtAuth.getCompanyId() } `)
      .pipe(
        catchError(this.handleError)
      )    
  }


  
  public GetSalesInvoiceLists(id): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/InventoryVouchers/GetSalesInvoiceLists/'
      + this.jwtAuth.getLang() + '/' + id  + '/' + this.jwtAuth.getCompanyId()} `)
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