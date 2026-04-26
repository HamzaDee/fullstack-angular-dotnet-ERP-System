import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerOpeningBalanceService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }

  public GetCustomersOpeningBalanceList(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/CustomersOpeningBalance/CustomersOpeningBalanceList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public SaveCustomersOpeningBalance(post): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/CustomersOpeningBalance/SaveCustomersOpeningBalance/'
      + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()} `,JSON.stringify(post),httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

 /*  public PostCustomersOpeningBalance(voucherId,isPosted): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.put(`${environment.apiURL_Main + '/api/CustomersOpeningBalance/PosCustomersOpeningBalance/'
      + voucherId + '/'+ isPosted + '/'  + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,null,httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  } */

  

    public PostCustomersOpeningBalance(voucherId,isPosted): Observable<any> {
      const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      var urlDelete = `${environment.apiURL_Main + '/api/CustomersOpeningBalance/PosCustomersOpeningBalance/' + voucherId + '/'+ isPosted +'/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`;
      return this.http.post<any>(urlDelete,'',httpOptions)
        .pipe(
          catchError(this.handleError)
        );
    }

/*   public DeleteCustomersOpeningBalance(voucherId): Observable<any> {
    debugger    
    return this.http.delete(`${environment.apiURL_Main + '/api/CustomersOpeningBalance/DeleteCustomersOpeningBalance/'
      + voucherId + '/' +this.jwtAuth.getUserId()  + '/' + this.jwtAuth.getCompanyId()} `)
      .pipe(
        catchError(this.handleError)
      )
  } */

  
    //delete
    public DeleteCustomersOpeningBalance(voucherId): Observable<any> {
      debugger
      const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      var urlDelete = `${environment.apiURL_Main + '/api/CustomersOpeningBalance/DeleteCustomersOpeningBalance/' + voucherId +'/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`;
      return this.http.post<any>(urlDelete,'',httpOptions)
        .pipe(
          catchError(this.handleError)
        );
    }

  public GetSerialOpeningBalance(serialType, voucherTypeId, VoucherCategory, year, month): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/CustomersOpeningBalance/GetCusSerialVoucher/'
      + this.jwtAuth.getCompanyId() + '/' + serialType + '/' + voucherTypeId + '/' + VoucherCategory + '/' + year + '/' + month} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetInitailCustomersOpeningBalance(voucherId, opType): Observable<any> {
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
        return this.http.get(`${environment.apiURL_Main + '/api/CustomersOpeningBalance/ShowCustomersOpeningBalance/' + this.jwtAuth.getLang()
          + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
          .pipe(
            catchError(this.handleError)
          )
      }
      else{
        return this.http.get(`${environment.apiURL_Main + '/api/CustomersOpeningBalance/GetCustomersOpeningBalanceById/' + this.jwtAuth.getLang() 
        + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
        .pipe(
          catchError(this.handleError)
        )
      }
    }
    else{
      return this.http.get(`${environment.apiURL_Main + '/api/CustomersOpeningBalance/GetCustomersOpeningBalanceForm/' + this.jwtAuth.getLang() 
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
        .pipe(
          catchError(this.handleError)
        )
    }   
  }


  public GetValidVoucherNo(VoucherNo, VoucherTypeId): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/CustomersOpeningBalance/IsValidVoucherNo/' + this.jwtAuth.getCompanyId() + '/' + VoucherNo + '/' + VoucherTypeId}`)
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
