import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';

@Injectable({
  providedIn: 'root'
})
export class PurchaseRequestService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }

  public GetPurchaseRequestList(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/PurchaseRequest/PurchaseRequestList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public SavePurchaseRequest(post): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/PurchaseRequest/SavePurchaseRequest/'
      + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,JSON.stringify(post),httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  public PostEntryVoucher(voucherId): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.put(`${environment.apiURL_Main + '/api/EntryVouchers/PostVoucher/'
      + voucherId + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,null,httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  public IfExistVoucher(VoucherTypeId, VoucherNo): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/PurchaseRequest/CheckVoucherNo/' + this.jwtAuth.getCompanyId() 
      + '/' + this.jwtAuth.getUserId() + '/' +  VoucherTypeId  + '/' + VoucherNo}`)
      .pipe(
        catchError(this.handleError)
      )
  }

      //delete
      public DeleteVoucher(voucherId): Observable<any> {
        const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
        var urlDelete = `${environment.apiURL_Main + '/api/PurchaseRequest/DeletePueRequest/' + voucherId +'/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`;
        return this.http.post<any>(urlDelete,'',httpOptions)
          .pipe(
            catchError(this.handleError)
          );
      }

  public GetSerialVoucher(serialType, voucherTypeId, VoucherCategory, year, month): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/PurchaseRequest/GetPueRequestVoucher/'
      + this.jwtAuth.getCompanyId() + '/' + serialType + '/' + voucherTypeId + '/' + VoucherCategory + '/' + year + '/' + month} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetInitailPurRequest(voucherId, opType): Observable<any> {
    if(voucherId > 0){
      if(opType == 'Copy'){
        return this.http.get(`${environment.apiURL_Main + '/api/PurchaseRequest/CopyPurRequestVoucher/' + this.jwtAuth.getLang() 
        + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
        .pipe(
          catchError(this.handleError)
        )
      }
      else if(opType == 'Reverse'){
        return this.http.get(`${environment.apiURL_Main + '/api/EntryVouchers/ReverseEntryVoucher/' + this.jwtAuth.getLang() 
        + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
        .pipe(
          catchError(this.handleError)
        )
      }
       else if(opType == 'Show'){
       return this.http.get(`${environment.apiURL_Main + '/api/PurchaseRequest/ShowPurchaseRequestForm/' + this.jwtAuth.getLang() 
        + '/' + voucherId + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
        .pipe(
          catchError(this.handleError)
        )
      }
      else{
        return this.http.get(`${environment.apiURL_Main + '/api/PurchaseRequest/GetPurchaseRequestFormById/' + this.jwtAuth.getLang() 
        + '/' + voucherId + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
        .pipe(
          catchError(this.handleError)
        )
      }
    }
    else{
      return this.http.get(`${environment.apiURL_Main + '/api/PurchaseRequest/AddPurchaseRequestForm/' + this.jwtAuth.getLang() 
      + '/' + voucherId + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
        .pipe(
          catchError(this.handleError)
        )
    }   
  }
  public GetEntryVouchersSearchList(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/EntryVouchers/EntryVouchersList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
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


public GetItemUintbyItemId(id): Observable<any> {
  return this.http.get(`${environment.apiURL_Main + '/api/ItemsSets/GetItemUintbyItemId/'
    + this.jwtAuth.getCompanyId() + '/' + id + '/' + this.jwtAuth.getLang()} `)
    .pipe(
      catchError(this.handleError)
    )
}


public GetItemQtyLimit(ItemId,StoreId): Observable<any> {
  return this.http.get(`${environment.apiURL_Main + '/api/PurchaseRequest/GetItemQtyLimit/'
    + this.jwtAuth.getCompanyId()  + '/' + ItemId + '/' + StoreId} `)
    .pipe(
      catchError(this.handleError)
    )
}

public GetItemQty(itemId:number,storeId:number): Observable<any> {
  debugger
  return this.http.get(`${environment.apiURL_Main + '/api/InventoryVouchers/GetItemQty/'
    + this.jwtAuth.getCompanyId() + '/' + itemId + '/' + storeId } `)
    .pipe(
      catchError(this.handleError)
    )    
}


public GetUnitId(ItemId): Observable<any> {
  debugger
  return this.http.get(`${environment.apiURL_Main + '/api/PurchaseRequest/GetUnitId/' + ItemId }`)
    .pipe(
      catchError(this.handleError)
    )    
}

public GetInternalPurchaseRequest(Id): Observable<any> 
{
  return this.http.get(`${environment.apiURL_Main + '/api/PurchaseRequest/GetInternalPurchaseRequest/'
    + this.jwtAuth.getLang()  + '/' + this.jwtAuth.getCompanyId() + '/' + Id } `)
    .pipe(
      catchError(this.handleError)
    )    
}


  public ImportFromExcel(post): Observable<any> {
  return this.http.post<any>(`${environment.apiURL_Main + '/api/PurchaseRequest/ImportFromExcel/' +
    this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`, post)
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
