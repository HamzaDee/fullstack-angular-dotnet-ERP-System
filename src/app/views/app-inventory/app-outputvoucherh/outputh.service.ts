import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
@Injectable({
  providedIn: 'root'
})
export class OutputService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }

  public GetOutputVoucherList(voucherTypeEnum :any): Observable<any> {
    
    return this.http.get(`${environment.apiURL_Main + '/api/OutputVoucherH/OutputVoucherHList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()+ '/' + voucherTypeEnum} `)
      .pipe(
        catchError(this.handleError)
      )
  }


  public GetInitailoutputVoucher(voucherId :any, opType :any,voucherTypeNo :any): Observable<any> {
    debugger
    if(voucherId > 0){
     if (opType == 'Show')
        {
          return this.http.get(`${environment.apiURL_Main + '/api/OutputVoucherH/ShowOutputVoucherH/' + this.jwtAuth.getLang() 
        + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId + '/' + voucherTypeNo} `)
        .pipe(
          catchError(this.handleError)
        )
        }
      else{
        return this.http.get(`${environment.apiURL_Main + '/api/OutputVoucherH/EditOutputVoucherH/' + this.jwtAuth.getLang() 
        + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId + '/' + voucherTypeNo} `)
        .pipe(
          catchError(this.handleError)
        )
      }
    }
    else{
      return this.http.get(`${environment.apiURL_Main + '/api/OutputVoucherH/AddOutputVoucherH/' + this.jwtAuth.getLang() 
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherTypeNo} `)
        .pipe(
          catchError(this.handleError)
        )
    }   
  }
  

  public GetInputItems(id :any): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/OutputVoucherH/GetInputItems/'
      + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getLang() + '/' + id} `)
      .pipe(
        catchError(this.handleError)
      )
  }
  

  public GetItemUintbyItemId(id :any): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/General/GetUnitByItemId/'
      + this.jwtAuth.getLang()  + '/' + this.jwtAuth.getCompanyId() + '/' + id} `)
      .pipe(
        catchError(this.handleError)
      )
  }


  public GetUnitRate(itemId :any, UnitId :any): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/General/GetUnitRate/'
      + itemId  + '/' + UnitId} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetCurrentQty(itemId :any, StoreId :any): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/OutputVoucherH/GetCurrentQty/'
      + this.jwtAuth.getCompanyId()  + '/' + itemId + '/' + StoreId} `)
      .pipe(
        catchError(this.handleError)
      )
  }


  public SaveOutputVoucher(post:any): Observable<any> {
    
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/OutputVoucherH/SaveOutputVoucherH/'
      + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,JSON.stringify(post),httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }



  public PostInvVoucher(voucherId :any): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    var urlDelete = `${environment.apiURL_Main + '/api/InventoryVouchers/PostInvVoucher/' + voucherId +'/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`;
    return this.http.post<any>(urlDelete,'',httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }



   //delete
   public DeleteInvVoucher(voucherId :any): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    var urlDelete = `${environment.apiURL_Main + '/api/InventoryVouchers/DeleteInvVoucher/' + voucherId +'/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`;
    return this.http.post<any>(urlDelete,'',httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }



  public UpdateFavourite(screenId :any):Observable<any>
  {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      return this.http.post(`${environment.apiURL_Main + '/api/General/UpdateFavourite/'
        + screenId } `,null,httpOptions)
        .pipe(
          catchError(this.handleError)
        )
  }
  

 public ApproveInvVoucher(id:any): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/OutputVoucherH/ApproveVoucher/'
      + this.jwtAuth.getCompanyId() + '/' + id + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }


 

  public GetFavouriteStatus(screenId:any)
  {
    return this.http.get(`${environment.apiURL_Main + '/api/General/GetFavouriteStatus/' + screenId  } `)
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