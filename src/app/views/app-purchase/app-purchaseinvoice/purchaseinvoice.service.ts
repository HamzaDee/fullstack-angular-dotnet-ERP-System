import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';

@Injectable({
  providedIn: 'root'
})
export class PurchaseInvoiceService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }

public GetPurchaseInvoiceList(voucherTypeEnum): Observable<any> 
  {
    return this.http.get(`${environment.apiURL_Main + '/api/PurchaseInvoice/PurchaseInvoiceList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()+ '/' + voucherTypeEnum} `)
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

  public GetInitailPurchaseInvoice(voucherId, opType,voucherTypeEnum): Observable<any> {
    if(!voucherId)
      voucherId = 0;
    if(voucherId > 0){
      if(opType == 'Copy'){
        return this.http.get(`${environment.apiURL_Main + '/api/PurchaseInvoice/CopyPurchaseInvoice/' + this.jwtAuth.getLang() 
        + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId + '/' + voucherTypeEnum} `)
        .pipe(
          catchError(this.handleError)
        )
      }
      else if (opType == 'Show')
        {
          return this.http.get(`${environment.apiURL_Main + '/api/PurchaseInvoice/ShowPurchaseInvoiceForm/' + this.jwtAuth.getLang() 
        + '/' + voucherId + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherTypeEnum} `)
        .pipe(
          catchError(this.handleError)
        )
        }
      else{
        return this.http.get(`${environment.apiURL_Main + '/api/PurchaseInvoice/EditPurchaseInvoiceFormById/' + this.jwtAuth.getLang() 
        + '/' + voucherId + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherTypeEnum} `)
        .pipe(
          catchError(this.handleError)
        )
      }
    }
    else{
      return this.http.get(`${environment.apiURL_Main + '/api/PurchaseInvoice/AddPurchaseInvoiceForm/' + this.jwtAuth.getLang() 
      + '/' + voucherId + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherTypeEnum} `)
        .pipe(
          catchError(this.handleError)
        )
    }   
  }

  public GetPurchaseInvoiceListBySearch(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/PurchaseInvoice/GetPurchaseInvoiceSearchList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )    
  }

  public GetItemsByOrder(Id): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/PurchaseInvoice/GetItemsByOrder/'
      + Id + '/' + this.jwtAuth.getCompanyId() } `)
      .pipe(
        catchError(this.handleError)
      )    
  }

  public SavePurchaseInvoice(post): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/PurchaseInvoice/SavePurchaseInvoice/'
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


  public DeleteAttachments(Id , TypeId): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/PurchaseInvoice/DeleteAttachments/'
      + Id  + '/' + TypeId} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetDealerInfo(DealerId): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/Common/GetDealerInfo/'
      + DealerId  + '/' + this.jwtAuth.getCompanyId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public PostPurchaseInvoice(voucherId,voucherTypeId,voucherNo): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    var urlDelete = `${environment.apiURL_Main + '/api/PurchaseInvoice/PostPurchaseInvoice/' + voucherId +
     '/' + voucherTypeId + '/' + voucherNo + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`;
    return this.http.post<any>(urlDelete,'',httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  public IfExistVoucher(VoucherTypeId, VoucherNo): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/SalesInvoice/CheckVoucherNo/' + this.jwtAuth.getCompanyId() 
      + '/' + this.jwtAuth.getUserId() + '/' +  VoucherTypeId  + '/' + VoucherNo}`)
      .pipe(
        catchError(this.handleError)
      )
  }


     //delete
     public DeletePurchaseInvoice(voucherId,voucherTypeId,voucherNo,voucherTypeEnum): Observable<any> {
      debugger
      const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      var urlDelete = `${environment.apiURL_Main + '/api/PurchaseInvoice/DeletetPurchaseInvoice/' + voucherId +
       '/' + voucherTypeId + '/' + voucherNo + '/' + voucherTypeEnum + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`;
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


  public GetReceiptslist(Id,ModelId): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/PurchaseInvoice/GetReceiptsLists/'
      + this.jwtAuth.getLang() + '/' + Id + '/' + this.jwtAuth.getCompanyId() + '/' +  ModelId } `)
      .pipe(
        catchError(this.handleError)
      )    
  }

  public getReceiptVoucherItems(ID): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/PurchaseInvoice/GetReceiptVoucherItems/' +  ID + '/' +  this.jwtAuth.getCompanyId()}`)
      .pipe(
        catchError(this.handleError)
      )
  }


  public getExpensesAccounts(id): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/PurchaseInvoice/GetExpensesAccount/' +  this.jwtAuth.getCompanyId() + '/' + id}`)
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