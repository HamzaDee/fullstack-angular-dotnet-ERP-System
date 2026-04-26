import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { environment } from 'environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SalesordersService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }

  GetSalesOrdersList() : Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/SalesOrder/GetSalesOrdersList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  ApproveOrder(orderId) : Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/SalesOrder/ApproveSalesOrder/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + orderId} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  GetSalesOrder(orderId, opType) : Observable<any> {
    debugger
    if(orderId === undefined)
      orderId = 0;
    if(opType == 'Edit' || opType == 'Copy'){
      return this.http.get(`${environment.apiURL_Main + '/api/SalesOrder/EditSalesOrder/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + orderId} `)
      .pipe(
        catchError(this.handleError)
      )
    }
    else if (opType == 'Show')
      {
         return this.http.get(`${environment.apiURL_Main + '/api/SalesOrder/ShowSalesOrder/'
        + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + orderId} `)
        .pipe(
          catchError(this.handleError)
        )
      }
    else{
      return this.http.get(`${environment.apiURL_Main + '/api/SalesOrder/GetSalesOrder/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + orderId} `)
      .pipe(
        catchError(this.handleError)
      )
    }
    
  }

  public getPriceByCountryAndAgent(itemId,CountryId,agentId): Observable<any> {  
    return this.http.get(`${environment.apiURL_Main + '/api/Forecasting/GetPriceByCountryAndAgent/' +
      itemId + '/' + CountryId + '/' + parseInt(agentId)}`)
      .pipe(
        catchError(this.handleError)
      )
  }

  //طباعه
public PrintSalesOrder(orderId): Observable<any> {   
  debugger
  return this.http.get(`${environment.apiURL_Main + '/api/SalesOrder/PrintSalesOrder/'
    + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + orderId} `)
    .pipe(
      catchError(this.handleError)
    )
}

  GetItemUnits(itemNo) : Observable<any> {
    debugger
    itemNo = itemNo.replaceAll('/','%2F');
    return this.http.get(`${environment.apiURL_Main + '/api/ProductionLines/GetItemUnits/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + itemNo} `)
      .pipe(
        catchError(this.handleError)
      )
  }

/*   DeleteSalesOrder(orderId) : Observable<any> {
    debugger
    return this.http.delete<any>(`${environment.apiURL_Main + '/api/SalesOrder/DeleteSalesOrder/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + orderId }`)
      .pipe(
        catchError(this.handleError)
      )
  } */

                //delete
    public DeleteSalesOrder(orderId): Observable<any> {
      const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      var urlDelete = `${environment.apiURL_Main + '/api/SalesOrder/DeleteSalesOrder/' + this.jwtAuth.getLang() +'/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()+ '/' + orderId }`;
      return this.http.post<any>(urlDelete,'',httpOptions)
        .pipe(
          catchError(this.handleError)
        );
    }

  public SaveSalesOrder(post): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/SalesOrder/SaveSalesOrder/'
      + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,JSON.stringify(post),httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetSerialVoucher(serialType): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/SalesOrder/GetSerialVoucher/'
      + this.jwtAuth.getCompanyId() + '/' + serialType } `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetAllItemsWithPrice(CountryId,agentId): Observable<any> {  
    return this.http.get(`${environment.apiURL_Main + '/api/Forecasting/GetAllItemsWithPrice/' +
      this.jwtAuth.getLang() + '/' + CountryId + '/' + parseInt(agentId)}`)
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
