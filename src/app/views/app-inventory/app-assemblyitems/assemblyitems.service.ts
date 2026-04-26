import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
@Injectable({
  providedIn: 'root'
})
export class AssemblyitemsService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }

  public GetAssemblyItemsList(isAssembley): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/AssemblyItemss/GetAssemblyItemssList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + isAssembley} `)
      .pipe(
        catchError(this.handleError)
      )
  }



    public SaveManuFuEquations(post): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/AssemblyItemss/SaveAssemblyItems/'
        + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() } `,JSON.stringify(post),httpOptions)
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
      //delete
    public DeleteVoucher(voucherId): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    var urlDelete = `${environment.apiURL_Main + '/api/AssemblyItemss/DeleteAssemblyItems/' + voucherId +'/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`;
    return this.http.post<any>(urlDelete,'',httpOptions)
        .pipe(
        catchError(this.handleError)
        );
    }

  public GetSerialVoucher(IsAssembley): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/AssemblyItemss/GetMaxSerialAssembly/'
      + this.jwtAuth.getCompanyId() +'/' + IsAssembley} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public CheckIfExistItemId(ItemId): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/manfuEquations/GetIfExistItemId/'
      + this.jwtAuth.getCompanyId() + '/' + ItemId} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetInitailAssemblyItems(voucherId, opType,isAssembleyy): Observable<any> {
    debugger
    if(voucherId > 0 && opType =="Edit"){
        return this.http.get(`${environment.apiURL_Main + '/api/AssemblyItemss/GetAssemblyItemsFormById/' + this.jwtAuth.getLang() 
          + '/' + this.jwtAuth.getCompanyId()+ '/' + this.jwtAuth.getUserId() + '/' + voucherId + '/' + isAssembleyy} `)
        .pipe(
          catchError(this.handleError)
        )      
    }
    else if (voucherId > 0 && opType =="Copy")
      {
        return this.http.get(`${environment.apiURL_Main + '/api/AssemblyItemss/GetCopyAssemblyItems/' + this.jwtAuth.getLang() 
          + '/' + this.jwtAuth.getCompanyId()+ '/' + this.jwtAuth.getUserId() + '/' + voucherId + '/' + isAssembleyy} `)
        .pipe(
          catchError(this.handleError)
        )      
      }
    else if (voucherId > 0 && opType =="Show")
      {
        return this.http.get(`${environment.apiURL_Main + '/api/AssemblyItemss/ShowAssemblyItemsForm/' + this.jwtAuth.getLang() 
          + '/' + this.jwtAuth.getCompanyId()+ '/' + this.jwtAuth.getUserId() + '/' + voucherId + '/' + isAssembleyy} `)
        .pipe(
          catchError(this.handleError)
        )      
      }
    else{
      return this.http.get(`${environment.apiURL_Main + '/api/AssemblyItemss/AddAssemblyItemsForm/' + this.jwtAuth.getLang() 
      + '/' + this.jwtAuth.getCompanyId()+ '/' + this.jwtAuth.getUserId() + '/' + voucherId + '/' + isAssembleyy} `)
        .pipe(
          catchError(this.handleError)
        )
    }   
  }


  public GetItemQty(itemId:number,storeId:number,unitId:number,transDate?:any,qty?:number): Observable<any> {
    debugger
    if(qty == undefined || qty == null)
      {
        qty = 0;
      }
    if(transDate == undefined || transDate == "")
      {
        transDate = null;
      }
    return this.http.get(`${environment.apiURL_Main + '/api/InventoryVouchers/GetItemsQty/'
      + this.jwtAuth.getCompanyId() + '/' + itemId + '/' + storeId + '/' + unitId + '/' + transDate + '/' + qty} `)
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



  public IfExistVoucher(voucherNo , IsAssembley): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/AssemblyItemss/IfExistVoucher/'
      + this.jwtAuth.getCompanyId()  + '/' + voucherNo + '/' + IsAssembley} `)
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