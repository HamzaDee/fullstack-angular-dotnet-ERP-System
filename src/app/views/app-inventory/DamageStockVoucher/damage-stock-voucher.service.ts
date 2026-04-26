import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';

@Injectable({
  providedIn: 'root'
})
export class DamageStockVoucherService {


  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }

    public GetDamageStockVoucherList(): Observable<any> {
      debugger
      return this.http.get(`${environment.apiURL_Main + '/api/DamageStockVoucher/DamageStockList/'
        + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
        .pipe(
          catchError(this.handleError)
        )
    }
  
  
    public GetInitailDamageStockVoucher(voucherId, opType): Observable<any> {
      debugger
      if(voucherId > 0){
        if(opType == 'Copy'){
          return this.http.get(`${environment.apiURL_Main + '/api/DamageStockVoucher/CopyDamageStockVoucher/' + this.jwtAuth.getLang() 
          + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
          .pipe(
            catchError(this.handleError)
          )
        }
        else if (opType == 'Show')
        {
        return this.http.get(`${environment.apiURL_Main + '/api/DamageStockVoucher/ShowDamageStockVoucher/' + this.jwtAuth.getLang() 
          + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
          .pipe(
            catchError(this.handleError)          
        )
        }
        else{
          return this.http.get(`${environment.apiURL_Main + '/api/DamageStockVoucher/EditDamageStockVoucher/' + this.jwtAuth.getLang() 
          + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
          .pipe(
            catchError(this.handleError)
          )
        }
      }
      else{
        return this.http.get(`${environment.apiURL_Main + '/api/DamageStockVoucher/AddDamageStock/' + this.jwtAuth.getLang() 
        + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
          .pipe(
            catchError(this.handleError)
          )
      }   
    }
  
  
    public GetItemUintbyItemId(id): Observable<any> {
      return this.http.get(`${environment.apiURL_Main + '/api/General/GetUnitByItemId/'
        + this.jwtAuth.getLang()  + '/' + this.jwtAuth.getCompanyId() + '/' + id} `)
        .pipe(
          catchError(this.handleError)
        )
    }
  
  
    public GetSerialVoucher(serialType, voucherTypeId, VoucherCategory, year, month): Observable<any> {
      debugger
      return this.http.get(`${environment.apiURL_Main + '/api/DamageStockVoucher/GetInvSerialVoucher/'
        + this.jwtAuth.getCompanyId() + '/' + serialType + '/' + voucherTypeId + '/' + VoucherCategory + '/' + year + '/' + month} `)
        .pipe(
          catchError(this.handleError)
        )
    }
  
  
    public SaveDamageStockVoucher(post): Observable<any> {
      debugger
      const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      return this.http.post<any>(`${environment.apiURL_Main + '/api/DamageStockVoucher/SaveDamageStockVoucher/'
        + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,JSON.stringify(post),httpOptions)
        .pipe(
          catchError(this.handleError)
        )
    }
  
  
   /*  public PostDamageStock(voucherId): Observable<any> {
      debugger
      const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      return this.http.put(`${environment.apiURL_Main + '/api/DamageStockVoucher/PostDamageStockVoucher/'
        + voucherId + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,null,httpOptions)
        .pipe(
          catchError(this.handleError)
        )
    } */

    public PostDamageStock(voucherId): Observable<any> {
      const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      var urlDelete = `${environment.apiURL_Main + '/api/DamageStockVoucher/PostDamageStockVoucher/' + voucherId +'/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`;
      return this.http.post<any>(urlDelete,'',httpOptions)
        .pipe(
          catchError(this.handleError)
        );
    }
  
  
 /*    public DeleteDamageStock(voucherId): Observable<any> {
      debugger    
      return this.http.delete(`${environment.apiURL_Main + '/api/DamageStockVoucher/DeletetDamageStockVoucher/'
        + voucherId + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
        .pipe(
          catchError(this.handleError)
        )
    } */


  //الحذف
    public DeleteDamageStock(voucherId): Observable<any> {
      const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      var urlDelete = `${environment.apiURL_Main + '/api/DamageStockVoucher/DeletetDamageStockVoucher/' + voucherId +'/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`;
      return this.http.post<any>(urlDelete,'',httpOptions)
        .pipe(
          catchError(this.handleError)
        );
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
