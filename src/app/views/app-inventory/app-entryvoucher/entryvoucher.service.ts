import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
@Injectable({
  providedIn: 'root'
})
export class EntryService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }

  public GetEntryVoucherList(voucherTypeEnum): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/EntryyVoucher/InvVouchersList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()+ '/' + voucherTypeEnum} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetInitailEntryVoucher(voucherId, opType,voucherTypeNo ): Observable<any> {
    if(voucherId > 0){
      if(opType == 'Copy'){
        return this.http.get(`${environment.apiURL_Main + '/api/EntryyVoucher/CopyInvVoucher/' + this.jwtAuth.getLang() 
        + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId + '/' + voucherTypeNo} `)
        .pipe(
          catchError(this.handleError)
        )
      }
      else if(opType == 'Show')
        {
         return this.http.get(`${environment.apiURL_Main + '/api/EntryyVoucher/ShowInvVoucher/' + this.jwtAuth.getLang() 
        + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId + '/' + voucherTypeNo} `)
        .pipe(
          catchError(this.handleError)
        )
        }
      else{
        return this.http.get(`${environment.apiURL_Main + '/api/EntryyVoucher/EditInvVoucher/' + this.jwtAuth.getLang() 
        + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId + '/' + voucherTypeNo} `)
        .pipe(
          catchError(this.handleError)
        )
      }
    }
    else{
      return this.http.get(`${environment.apiURL_Main + '/api/EntryyVoucher/AddInvVoucher/' + this.jwtAuth.getLang() 
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherTypeNo} `)
        .pipe(
          catchError(this.handleError)
        )
    }   
  }


  public GetItemUnitbyItemId(id): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/General/GetUnitByItemId/'
      + this.jwtAuth.getLang()  + '/' + this.jwtAuth.getCompanyId() + '/' + id} `)
      .pipe(
        catchError(this.handleError)
      )
  }


  public GetAllowEditBatch(BatchNo,ItemId)
  {
    return this.http.get(`${environment.apiURL_Main + '/api/PurchaseInvoice/GetAllowEditBatchExpiry/' + BatchNo + '/' + ItemId}`)
    .pipe(
      catchError(this.handleError)
    )
  }



  public GetServedItems(voucherId): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/ItemsReservationVoucher/EditItemsReservationVoucher/' + this.jwtAuth.getLang() 
        + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
        .pipe(
          catchError(this.handleError)
        )
  }
    

  // public GetItemUintbyItemId(id): Observable<any> {
  //   return this.http.get(`${environment.apiURL_Main + '/api/General/GetUnitByItemId/'
  //     + this.jwtAuth.getLang()  + '/' + this.jwtAuth.getCompanyId() + '/' + id} `)
  //     .pipe(
  //       catchError(this.handleError)
  //     )
  // }


  public GetUnitRate(itemId , UnitId): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/General/GetUnitRate/'
      + itemId  + '/' + UnitId} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetSerialVoucher(serialType, voucherTypeId, VoucherCategory, year, month): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/EntryyVoucher/GetInvSerialVoucher/'
      + this.jwtAuth.getCompanyId() + '/' + serialType + '/' + voucherTypeId + '/' + VoucherCategory + '/' + year + '/' + month} `)
      .pipe(
        catchError(this.handleError)
      )
  }


  public SaveEntryVoucher(post): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/EntryyVoucher/SaveEntryyVoucher/'
      + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,JSON.stringify(post),httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }




  public PostInvVoucher(voucherId): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    var urlDelete = `${environment.apiURL_Main + '/api/EntryyVoucher/PostInvVoucher/' + voucherId +'/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`;
    return this.http.post<any>(urlDelete,'',httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }


   //delete
   public DeleteInvVoucher(voucherId): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    var urlDelete = `${environment.apiURL_Main + '/api/EntryyVoucher/DeleteInvVoucher/' + voucherId +'/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`;
    return this.http.post<any>(urlDelete,'',httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }


  public getItemQtyFromStore(itemId:number, unitId:number, qty:number, storeId:number): Observable<any> {
    debugger
    if(qty == undefined || qty == null)
    {
      qty = 0;
    }
    return this.http.get(`${environment.apiURL_Main + '/api/EntryyVoucher/GetItemQtyFromStore/'
      + this.jwtAuth.getCompanyId() + '/' + itemId + '/' + unitId + '/' + qty + '/' + storeId}`)
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
    return this.http.get(`${environment.apiURL_Main + '/api/General/GetFavouriteStatus/' + screenId  } `)
    .pipe(
      catchError(this.handleError)
    )
  }


    public ImportFromExcel(post): Observable<any> {
  return this.http.post<any>(`${environment.apiURL_Main + '/api/EntryyVoucher/ImportFromExcel/' +
    this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`, post)
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