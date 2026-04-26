import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';

@Injectable({
  providedIn: 'root'
})
export class MaintOrderService {

  constructor(
    private readonly http: HttpClient,
    private readonly jwtAuth: JwtAuthService,
  ) { }

public GetMaintenanceOrdersList(): Observable<any> {
  debugger
  return this.http.get(`${environment.apiURL_Main + '/api/MaintenanceOrder/GetMaintenanceOrdersList/'
    + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
    .pipe(
      catchError(this.handleError)
    )
}

public SaveMaintenanceOrder(post): Observable<any> {
  debugger
  const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  return this.http.post<any>(`${environment.apiURL_Main + '/api/MaintenanceOrder/SaveMaintenanceOrder/'
    + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,JSON.stringify(post),httpOptions)
    .pipe(
      catchError(this.handleError)
    )
}

// public DeleteProject(Id): Observable<any> {
//   const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
//   var urlDelete = `${environment.apiURL_Main + '/api/ProjectDefinition/DeleteProject/' + Id +'/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`;
//   return this.http.post<any>(urlDelete,'',httpOptions)
//     .pipe(
//       catchError(this.handleError)
//     );
// }

public GetInitailMaintenanceOrder(Id,opType): Observable<any> {
  if(Id > 0){
    if(opType =='Show')
      {
        return this.http.get(`${environment.apiURL_Main + '/api/MaintenanceOrder/ShowMaintenanceOrderForm/' + this.jwtAuth.getLang() 
        + '/' + Id + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
        .pipe(
          catchError(this.handleError)
        )    
      }
      else
      {
        return this.http.get(`${environment.apiURL_Main + '/api/MaintenanceOrder/EditMaintenanceOrderForm/' + this.jwtAuth.getLang() 
      + '/' + Id + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )    
      }
        
  }
  else{
    return this.http.get(`${environment.apiURL_Main + '/api/MaintenanceOrder/AddMaintenanceOrderForm/' + this.jwtAuth.getLang() 
    + '/' + Id + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }   
}

  public GetItemSerials(itemId: number, storeId: number) {
    return this.http.get(`${environment.apiURL_Main + '/api/InventoryVouchers/GetItemsSerials/'
      + itemId + '/' + storeId} `)
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
    return this.http.get(`${environment.apiURL_Main + '/api/General/GetUnitByItemId/'
      + this.jwtAuth.getLang()  + '/' + this.jwtAuth.getCompanyId() + '/' + id} `)
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

  public getItemQtyFromStore(itemId: number, unitId: number, qty: number, storeId: number): Observable<any> {
    debugger
    qty ??= 0;
    return this.http.get(`${environment.apiURL_Main + '/api/OutputVoucherH/GetItemQtyFromStore/'
      + this.jwtAuth.getCompanyId() + '/' + itemId + '/' + unitId + '/' + qty + '/' + storeId}`)
      .pipe(
        catchError(this.handleError)
      )
  }


   public GetItemQty(itemId: number, storeId: number, unitId: number, transDate?: any, qty?: number): Observable<any> {
    debugger
    qty ??= 0;
    if (transDate == undefined || transDate == "") {
      transDate = null;
    }
    return this.http.get(`${environment.apiURL_Main + '/api/InventoryVouchers/GetItemsQty/'
      + this.jwtAuth.getCompanyId() + '/' + itemId + '/' + storeId + '/' + unitId + '/' + transDate + '/' + qty} `)
      .pipe(
        catchError(this.handleError)
      )
  }

   public GetMaxVoucher(Type,year): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/MaintenanceOrder/GetMaxVoucher/'
      + this.jwtAuth.getCompanyId()  + '/' + Type  + '/' + year} `)
      .pipe(
        catchError(this.handleError)
      )
  }


  public GetOrderItems(Id): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/MaintenanceOrder/GetOrderItems/'
      + this.jwtAuth.getCompanyId()  + '/' + this.jwtAuth.getUserId()  + '/' + this.jwtAuth.getLang() + '/' + Id} `)
      .pipe(
        catchError(this.handleError)
      )
  }



public DeletemaintenanceVoucher(VoucherId):Observable<any>
{
const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  return this.http.post(`${environment.apiURL_Main + '/api/MaintenanceOrder/DeletemaintenanceVoucher/'
    + this.jwtAuth.getCompanyId()  + '/' + this.jwtAuth.getUserId()  + '/' + VoucherId} `,null,httpOptions)
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
