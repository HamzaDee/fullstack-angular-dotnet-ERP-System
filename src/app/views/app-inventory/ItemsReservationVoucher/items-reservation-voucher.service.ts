import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { environment } from 'environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ItemsReservationVoucherService {


  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }

    public GetItemsReservationVoucherList(): Observable<any> {
      debugger
      return this.http.get(`${environment.apiURL_Main + '/api/ItemsReservationVoucher/ItemsReservationList/'
        + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
        .pipe(
          catchError(this.handleError)
        )
    }
  
  
    public GetInitailItemsReservationVoucher(voucherId, opType): Observable<any> {
      if(voucherId > 0){
        if(opType == 'Copy'){
          return this.http.get(`${environment.apiURL_Main + '/api/ItemsReservationVoucher/CopyItemsReservationVoucher/' + this.jwtAuth.getLang() 
          + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
          .pipe(
            catchError(this.handleError)
          )
        }
        else if (opType == 'Show')
        {
        return this.http.get(`${environment.apiURL_Main + '/api/ItemsReservationVoucher/ShowItemsReservationVoucher/' + this.jwtAuth.getLang() 
          + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
          .pipe(
            catchError(this.handleError)
          )
        }
        else{
          return this.http.get(`${environment.apiURL_Main + '/api/ItemsReservationVoucher/EditItemsReservationVoucher/' + this.jwtAuth.getLang() 
          + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
          .pipe(
            catchError(this.handleError)
          )
        }
      }
      else{
        return this.http.get(`${environment.apiURL_Main + '/api/ItemsReservationVoucher/AddItemsReservation/' + this.jwtAuth.getLang() 
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
      return this.http.get(`${environment.apiURL_Main + '/api/ItemsReservationVoucher/GetInvSerialVoucher/'
        + this.jwtAuth.getCompanyId() + '/' + serialType + '/' + voucherTypeId + '/' + VoucherCategory + '/' + year + '/' + month} `)
        .pipe(
          catchError(this.handleError)
        )
    }
  
  
    public SaveItemsReservationVoucher(post): Observable<any> {
      debugger
      const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      return this.http.post<any>(`${environment.apiURL_Main + '/api/ItemsReservationVoucher/SaveItemsReservationVoucher/'
        + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,JSON.stringify(post),httpOptions)
        .pipe(
          catchError(this.handleError)
        )
    }
  
  
/*     public PostItemsReservation(voucherId): Observable<any> {
      debugger
      const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      return this.http.put(`${environment.apiURL_Main + '/api/ItemsReservationVoucher/PostItemsReservationVoucher/'
        + voucherId + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,null,httpOptions)
        .pipe(
          catchError(this.handleError)
        )
    } */

        public PostItemsReservation(voucherId): Observable<any> {
          const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
          var urlDelete = `${environment.apiURL_Main + '/api/ItemsReservationVoucher/PostItemsReservationVoucher/' + voucherId +'/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`;
          return this.http.post<any>(urlDelete,'',httpOptions)
            .pipe(
              catchError(this.handleError)
            );
        }
  
  
/*     public DeleteItemsReservation(voucherId): Observable<any> {
      debugger    
      return this.http.delete(`${environment.apiURL_Main + '/api/ItemsReservationVoucher/DeletetItemsReservationVoucher/'
        + voucherId + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
        .pipe(
          catchError(this.handleError)
        )
    } */
  
  
   //الحذف
   public DeleteItemsReservation(voucherId): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    var urlDelete = `${environment.apiURL_Main + '/api/ItemsReservationVoucher/DeletetItemsReservationVoucher/' + voucherId +'/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`;
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
  
    
    formatCurrency(value: number, decimalPlaces: number): string {
      return value.toLocaleString(undefined, {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      });
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
