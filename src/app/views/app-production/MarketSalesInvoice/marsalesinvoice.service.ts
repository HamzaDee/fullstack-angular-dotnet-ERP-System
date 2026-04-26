import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import el from 'date-fns/esm/locale/el/index.js';

@Injectable({
  providedIn: 'root'
})
export class MarketSalesService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }

  public GetMarketSalesInvoiceList(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/MarketSalesInvoice/GetMarketSalesInvoiceList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }
  
  public GetMarSalesInvoiceForm(id,opType): Observable<any> {
    debugger
    if(id > 0)
    {
      if(opType =='Show')
        {
          return this.http.get(`${environment.apiURL_Main + '/api/MarketSalesInvoice/ShowMarketSalesInvoice/'
          + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id } `)
          .pipe(
          catchError(this.handleError)
          )      
        }
        else
        {
          return this.http.get(`${environment.apiURL_Main + '/api/MarketSalesInvoice/EditMarketSalesInvoice/'
          + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id } `)
          .pipe(
          catchError(this.handleError)
          )      
        }
        
    } 
    else{
      return this.http.get(`${environment.apiURL_Main + '/api/MarketSalesInvoice/AddMarketSalesInvoice/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id } `)
      .pipe(
        catchError(this.handleError)
      )
    }
    
  }

  public SaveMarketSalesInvoice(post): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/MarketSalesInvoice/SaveMarketSalesInvoice/' + this.jwtAuth.getUserId() + 
    '/' + this.jwtAuth.getCompanyId()}`, JSON.stringify(post), httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  public DeleteMarketSalesInvoice(voucherId): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    var urlDelete = `${environment.apiURL_Main + '/api/MarketSalesInvoice/DeleteMarketSalesInvoice/' + voucherId +'/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`;
    return this.http.post<any>(urlDelete,'',httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  public GetUnitItemsList(itemNo): Observable<any>
  {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/MarketSalesInvoice/GetUnitItemsList/'  + this.jwtAuth.getLang() + '/' + itemNo } `)
    .pipe(
      catchError(this.handleError)
    )
  }


  public GetSalesOrder(transNo): Observable<any>
  {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/MarketSalesInvoice/GetSalesOrder/'  + transNo} `)
    .pipe(
      catchError(this.handleError)
    )
  }


  public CheckifVoucherExist(VoucherNo): Observable<any>
  {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/MarketSalesInvoice/CheckifVoucherExist/'  + VoucherNo} `)
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
