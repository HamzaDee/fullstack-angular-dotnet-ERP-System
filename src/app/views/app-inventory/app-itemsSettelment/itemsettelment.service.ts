import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders , HttpParams } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
@Injectable({
  providedIn: 'root'
})
export class ItemsettelmentService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }

  public GetItemsSettelmentVoucherList(voucherTypeEnum): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/EntryyVoucher/InvVouchersList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherTypeEnum} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetItemsSettelmentVoucher(voucherId, opType, voucherTypeNo): Observable<any> {
    if (voucherId > 0) {
    if (opType == 'Show') {
          return this.http.get(`${environment.apiURL_Main + '/api/ItemsSettlement/ShowItemSettelment/' + this.jwtAuth.getLang()
            + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId + '/' + voucherTypeNo} `)
            .pipe(
              catchError(this.handleError)
            )
        }
        else {
          return this.http.get(`${environment.apiURL_Main + '/api/ItemsSettlement/EditItemSettelment/' + this.jwtAuth.getLang()
            + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId + '/' + voucherTypeNo} `)
            .pipe(
              catchError(this.handleError)
            )
        }
      }
    else {
      return this.http.get(`${environment.apiURL_Main + '/api/ItemsSettlement/GetItemSettelmentForm/' + this.jwtAuth.getLang()
        + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherTypeNo} `)
        .pipe(
          catchError(this.handleError)
        )
    }
  }


  public GetItemUnitbyItemId(id): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/General/GetUnitByItemId/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + id} `)
      .pipe(
        catchError(this.handleError)
      )
  }


  public GetAllowEditBatch(BatchNo, ItemId) {
    return this.http.get(`${environment.apiURL_Main + '/api/PurchaseInvoice/GetAllowEditBatchExpiry/' + BatchNo + '/' + ItemId}`)
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

  public GetSerialVoucher(serialType, voucherTypeId, VoucherCategory, year, month): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/EntryyVoucher/GetInvSerialVoucher/'
      + this.jwtAuth.getCompanyId() + '/' + serialType + '/' + voucherTypeId + '/' + VoucherCategory + '/' + year + '/' + month} `)
      .pipe(
        catchError(this.handleError)
      )
  }


  public SaveItemsSettelmentVoucher(post): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/ItemsSettlement/SaveSettelmentVoucher/'
      + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `, JSON.stringify(post), httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  public ApproveInvVoucher(id): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/ItemsSettlement/ApproveVoucher/'
      + this.jwtAuth.getCompanyId() + '/' + id + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  //delete
  public DeleteSettelementVoucher(voucherId): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    var urlDelete = `${environment.apiURL_Main + '/api/ItemsSettlement/DeleteSettelementVoucher/' + voucherId + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`;
    return this.http.post<any>(urlDelete, '', httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }


  public getItemQtyFromStore(itemId: number, unitId: number, qty: number, storeId: number): Observable<any> {
    debugger
    if (qty == undefined || qty == null) {
      qty = 0;
    }
    return this.http.get(`${environment.apiURL_Main + '/api/EntryyVoucher/GetItemQtyFromStore/'
      + this.jwtAuth.getCompanyId() + '/' + itemId + '/' + unitId + '/' + qty + '/' + storeId}`)
      .pipe(
        catchError(this.handleError)
      )
  }


  public GetSettelmentItems( 
    storeId: number,
    toDate:  string,
    groupId: number,
    categoryId: number,
    modelId: number,
    brandId: number,
  ): Observable<any> {
    debugger
    const lang = this.jwtAuth.getLang();
    const companyId = this.jwtAuth.getCompanyId();
    const userId = this.jwtAuth.getUserId();  
    const params = new HttpParams()
      .set('StoreId', storeId)
      .set('ToDate', toDate)
      .set('GroupId', groupId)
      .set('CategoryId', categoryId)
      .set('ModelId', modelId)
      .set('BrandId', brandId)    
    return this.http.get(`${environment.apiURL_Main}/api/ItemsSettlement/GetAdjustmentItems/${lang}/${companyId}/${userId}`, { params })
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

  public ImportFromExcel(post): Observable<any> {
    return this.http.post<any>(`${environment.apiURL_Main + '/api/ItemsSettlement/ImportSettelmentFromExcel/' +
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