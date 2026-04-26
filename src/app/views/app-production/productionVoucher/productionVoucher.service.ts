import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProdVoucherService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }

  public GetProductionOrdersList(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/ProductionVoucher/GetProductionOrdersList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public SaveProductionOrder(post): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/ProductionVoucher/SaveProductionOrder/'
      + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,JSON.stringify(post),httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

//   public GetItemUintbyItemId(id): Observable<any> {
//     return this.http.get(`${environment.apiURL_Main + '/api/General/GetUnitByItemId/'
//       + this.jwtAuth.getLang()  + '/' + this.jwtAuth.getCompanyId() + '/' + id} `)
//       .pipe(
//         catchError(this.handleError)
//       )
//   }
    //delete
    public DeleteProductionOrder(voucherId): Observable<any> {
      const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      var urlDelete = `${environment.apiURL_Main + '/api/ProductionVoucher/DeleteProductionOrder/' +  this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()+ '/' + voucherId}`;
      return this.http.post<any>(urlDelete,'',httpOptions)
        .pipe(
          catchError(this.handleError)
        );
    }

public GetSerialVoucher(serialType, voucherTypeId, VoucherCategory, year, month): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/ProductionVoucher/GetSerialVoucher/'
      + this.jwtAuth.getCompanyId() + '/' + serialType + '/' + voucherTypeId + '/' + VoucherCategory + '/' + year + '/' + month} `)
      .pipe(
        catchError(this.handleError)
      )
  }

//   public CheckIfExistItemId(ItemId): Observable<any> {
//     debugger
//     return this.http.get(`${environment.apiURL_Main + '/api/manfuEquations/GetIfExistItemId/'
//       + this.jwtAuth.getCompanyId() + '/' + ItemId} `)
//       .pipe(
//         catchError(this.handleError)
//       )
//   }

public GetItemUintbyItemId(id): Observable<any> {
  return this.http.get(`${environment.apiURL_Main + '/api/General/GetUnitByItemId/'
    + this.jwtAuth.getLang()  + '/' + this.jwtAuth.getCompanyId() + '/' + id} `)
    .pipe(
      catchError(this.handleError)
    )
}

  public GetProductionForm(voucherId, opType): Observable<any> {
    if(voucherId > 0){
      if(opType == 'Show')
        {
           return this.http.get(`${environment.apiURL_Main + '/api/ProductionVoucher/ShowProductionVoucher/' + this.jwtAuth.getLang() 
          + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' +  voucherId} `)
          .pipe(
            catchError(this.handleError)
          )    
        }
      else
        {
           return this.http.get(`${environment.apiURL_Main + '/api/ProductionVoucher/EditProductionVoucher/' + this.jwtAuth.getLang() 
          + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' +  voucherId} `)
          .pipe(
            catchError(this.handleError)
          )    
        }
         
    }
    else{
      return this.http.get(`${environment.apiURL_Main + '/api/ProductionVoucher/AddProductionVoucher/' + this.jwtAuth.getLang() 
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' +  voucherId} `)
        .pipe(
          catchError(this.handleError)
        )
    }   
  }


  public GetMaterialItems(ProductedItemId, UnitId, Qty): Observable<any> {
        return this.http.get(`${environment.apiURL_Main + '/api/ProductionVoucher/GetMaterialItems/' + this.jwtAuth.getLang() + '/' + 
         this.jwtAuth.getCompanyId() + '/' +  ProductedItemId + '/' + UnitId + '/' + Qty} `)
        .pipe(
          catchError(this.handleError)
        )      
  }


public ApproveProductionOrder(Id):Observable<any>
{
  const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post(`${environment.apiURL_Main + '/api/ProductionVoucher/ApproveProductionOrder/'
      + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' +  Id} `,null,httpOptions)
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


 public CloseProductionOrder(voucherId): Observable<any> {
      const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      var urlUpdate = `${environment.apiURL_Main + '/api/ProductionVoucher/CloseProduction/' +  this.jwtAuth.getCompanyId() + '/' + voucherId}`;
      return this.http.post<any>(urlUpdate,'',httpOptions)
        .pipe(
          catchError(this.handleError)
        );
    }

public GetFavouriteStatus(screenId)
{
  return this.http.get(`${environment.apiURL_Main + '/api/General/GetFavouriteStatus/' + screenId } `)
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

  public GetCurrentQty(itemId, StoreId): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/ProductionVoucher/GetCurrentQty/'
      +  this.jwtAuth.getCompanyId()   + '/' + itemId + '/' + StoreId} `)
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
