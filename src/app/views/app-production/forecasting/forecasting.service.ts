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
export class ForecastingService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }

  public GetForecastingList(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/Forecasting/GetForecastingList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }
  
  public GetForecastingForm(id, opType): Observable<any> {
    debugger
    if(id == undefined)
      id=0;
    if(id > 0)
    {
      if(opType == 'Copy'){
        return this.http.get(`${environment.apiURL_Main + '/api/Forecasting/CopyForecasting/'
          + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id } `)
          .pipe(
            catchError(this.handleError)
          )
      }
      else if(opType == 'Show'){
        return this.http.get(`${environment.apiURL_Main + '/api/Forecasting/ShowForecasting/'
          + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id } `)
          .pipe(
            catchError(this.handleError)
          )
      }
      else{
        return this.http.get(`${environment.apiURL_Main + '/api/Forecasting/EditForecasting/'
          + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id } `)
          .pipe(
            catchError(this.handleError)
          )
      }
    } 
    else{
      return this.http.get(`${environment.apiURL_Main + '/api/Forecasting/AddForecasting/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id } `)
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

  public GetcountriesList(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/Forecasting/GetForecastingList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }


  public PostForecasting(post): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/Forecasting/PostForecasting/' + this.jwtAuth.getUserId() + 
    '/' + this.jwtAuth.getCompanyId()}`, JSON.stringify(post), httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

/*   public DeleteForecasting(voucherId): Observable<any> {
    debugger    
    return this.http.delete(`${environment.apiURL_Main + '/api/Forecasting/DeleteForecasting/'
      + voucherId + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  } */

      public DeleteForecasting(voucherId): Observable<any> {
        const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
        var urlDelete = `${environment.apiURL_Main + '/api/Forecasting/DeleteForecasting/' + voucherId +'/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`;
        return this.http.post<any>(urlDelete,'',httpOptions)
          .pipe(
            catchError(this.handleError)
          );
      }


        //طباعه
public PrintForcasting(id): Observable<any> {   
  debugger
  return this.http.get(`${environment.apiURL_Main + '/api/Forecasting/PrintForcasting/'
    + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id } `)
    .pipe(
      catchError(this.handleError)
    )
}
  

public ApproveForcasting(id): Observable<any> {   
  debugger
  return this.http.get(`${environment.apiURL_Main + '/api/Forecasting/ApproveForecasting/' 
    + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id} `)
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
