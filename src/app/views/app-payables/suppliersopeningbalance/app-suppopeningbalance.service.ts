import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';

@Injectable({
  providedIn: 'root'
})
export class AppPayablesService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }

  public GetSuppliersOpeningBalanceList(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/SuppliersOpeningBalance/SuppliersOpeningBalanceList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public SaveSuppOpeningBalance(post): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/SuppliersOpeningBalance/SaveSuppliersOpeningBalance/'
      + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()} `,JSON.stringify(post),httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

/*   public PostOpeningBalance(voucherId,isPosted): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.put(`${environment.apiURL_Main + '/api/SuppliersOpeningBalance/PostSuppliersOpeningBalance/'
      + voucherId + '/'+ isPosted + '/'  + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,null,httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  } */

      public PostOpeningBalance(voucherId,isPosted): Observable<any> {
        const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
        var urlDelete = `${environment.apiURL_Main + '/api/SuppliersOpeningBalance/PostSuppliersOpeningBalance/' + voucherId + '/'+ isPosted + '/'  + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() }`;
        return this.http.post<any>(urlDelete,'',httpOptions)
          .pipe(
            catchError(this.handleError)
          );
      }

/*   public DeleteOpeningBalance(voucherId): Observable<any> {
    debugger    
    return this.http.delete(`${environment.apiURL_Main + '/api/SuppliersOpeningBalance/DeleteSuppliersOpeningBalance/'
      + voucherId + '/' +this.jwtAuth.getUserId()  + '/' + this.jwtAuth.getCompanyId()} `)
      .pipe(
        catchError(this.handleError)
      )
  } */

          //delete
    public DeleteOpeningBalance(voucherId): Observable<any> {
      const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      var urlDelete = `${environment.apiURL_Main + '/api/SuppliersOpeningBalance/DeleteSuppliersOpeningBalance/' + voucherId +'/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`;
      return this.http.post<any>(urlDelete,'',httpOptions)
        .pipe(
          catchError(this.handleError)
        );
    }

  public GetSerialOpeningBalance(serialType, voucherTypeId, VoucherCategory, year, month): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/SuppliersOpeningBalance/GetSuppSerialVoucher/'
      + this.jwtAuth.getCompanyId() + '/' + serialType + '/' + voucherTypeId + '/' + VoucherCategory + '/' + year + '/' + month} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetInitailOpeningBalance(voucherId, opType): Observable<any> {
    debugger
    if(voucherId > 0){
      if(opType == 'Copy'){
        return this.http.get(`${environment.apiURL_Main + '/api/OpeningBalance/CopyOpeningBalance/' + this.jwtAuth.getLang() 
        + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
        .pipe(
          catchError(this.handleError)
        )
      }
      else if(opType == 'Reverse'){
        return this.http.get(`${environment.apiURL_Main + '/api/OpeningBalance/ReverseOpeningBalance/' + this.jwtAuth.getLang() 
        + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
        .pipe(
          catchError(this.handleError)
        )
      }
            else if (opType == 'Show') {
        return this.http.get(`${environment.apiURL_Main + '/api/SuppliersOpeningBalance/ShowSuppliersOpeningBalance/' + this.jwtAuth.getLang()
          + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
          .pipe(
            catchError(this.handleError)
          )
      }
      else{
        return this.http.get(`${environment.apiURL_Main + '/api/SuppliersOpeningBalance/GetSuppliersOpeningBalanceById/' + this.jwtAuth.getLang() 
        + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
        .pipe(
          catchError(this.handleError)
        )
      }
    }
    else{
      return this.http.get(`${environment.apiURL_Main + '/api/SuppliersOpeningBalance/GetSuppliersOpeningBalanceForm/' + this.jwtAuth.getLang() 
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
        .pipe(
          catchError(this.handleError)
        )
    }   
  }

  public GetValidVoucherNo(VoucherNo, VoucherTypeId): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/SuppliersOpeningBalance/IsValidVoucherNo/' + this.jwtAuth.getCompanyId() + '/' + VoucherNo + '/' + VoucherTypeId}`)
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
    if (error.error instanceof ErrorEvent) {
      console.log(error.error.message)
    } else {
      console.log(error.status)
    }
    return throwError(
      console.log('Something is wrong!'));
  }
}
