import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProdReceiptService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }

public GetReceiptItemsVoucherList(): Observable<any> 
  {
    return this.http.get(`${environment.apiURL_Main + '/api/ProductionReceipt/ReceiptItemsVoucherList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetSerialVoucher(serialType, voucherTypeId, VoucherCategory, year, month): Observable<any> {
    
    return this.http.get(`${environment.apiURL_Main + '/api/ProductionReceipt/GetInvSerialVoucher/'
      + this.jwtAuth.getCompanyId() + '/' + serialType + '/' + voucherTypeId + '/' + VoucherCategory + '/' + year + '/' + month} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetInitailReceiptItemsVoucher(voucherId, opType,voucherTypeEnum): Observable<any> {
    if(voucherId > 0){
     if (opType == 'Show')
        {
        return this.http.get(`${environment.apiURL_Main + '/api/ProductionReceipt/ShowReceiptItemsVoucher/' + this.jwtAuth.getLang() 
          + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()  + '/' + voucherId} `)
          .pipe(
            catchError(this.handleError)
          )
        }
      else{
        return this.http.get(`${environment.apiURL_Main + '/api/ProductionReceipt/EditReceiptItemsVoucher/' + this.jwtAuth.getLang() 
        + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()  + '/' + voucherId} `)
        .pipe(
          catchError(this.handleError)
        )
      }
    }
    else{
      return this.http.get(`${environment.apiURL_Main + '/api/ProductionReceipt/AddReceiptItemsVoucher/' + this.jwtAuth.getLang() 
       + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherTypeEnum} `)
        .pipe(
          catchError(this.handleError)
        )
    }   
  }

  public GetReceiptItemsVoucherListBySearch(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/ReceiptItemsVoucher/GetReceiptItemsVoucherSearchList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )    
  }


  public SaveReceiptItemsVoucher(post): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/ProductionReceipt/SaveReceiptItemsVoucher/'
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


  public IfExistVoucher(VoucherTypeId, VoucherNo): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/InventoryVouchers/CheckVoucherNo/' + this.jwtAuth.getCompanyId() 
      + '/' + this.jwtAuth.getUserId() + '/' +  VoucherTypeId  + '/' + VoucherNo}`)
      .pipe(
        catchError(this.handleError)
      )
  }


      public PostReceiptItemsVoucher(voucherId): Observable<any> {
        const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
        var urlDelete = `${environment.apiURL_Main + '/api/ReceiptItemsVoucher/PostReceiptItemsVoucher/' + voucherId +'/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() }`;
        return this.http.post<any>(urlDelete,'',httpOptions)
          .pipe(
            catchError(this.handleError)
          );
      }




      //delete
      public DeleteReceiptItemsVoucher(voucherId): Observable<any> {
        const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
        const urlDelete = `${environment.apiURL_Main + '/api/ProductionReceipt/DeleteReceiptItemsVoucher/' + voucherId +'/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`;
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


  public GetAllowEditSerialNo(SerialNo,ItemId)
  {
    return this.http.get(`${environment.apiURL_Main + '/api/PurchaseInvoice/GetAllowEditSerialNo/' + SerialNo + '/' + ItemId}`)
    .pipe(
      catchError(this.handleError)
    )
  }


  public GetProdProucedItem(Id): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/ProductionReceipt/GetProdProucedItem/'
      + this.jwtAuth.getCompanyId()  + '/' + Id } `)
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