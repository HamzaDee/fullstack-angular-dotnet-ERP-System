import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
@Injectable({
  providedIn: 'root'
})
export class CurrencyService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }
  public GetCurrencyList(): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/Currency/GetCurrencyList/' +
      this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`)
      .pipe(
        catchError(this.handleError)
      )
  }
  public PostCurrency(post): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/Currency/PostCurrency/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`
      , JSON.stringify(post), httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }
  public GetCurrencyInitialForm(id): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/Currency/GetCurrencyInitailForm/' + this.jwtAuth.getLang() + '/'
      + id + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }
 /*  public DeleteCurrency(id): Observable<any> {
    var urlDelete = `${environment.apiURL_Main + '/api/Currency/DeleteCurrency/' + id + '/' + this.jwtAuth.getUserId()
      + '/' + this.jwtAuth.getCompanyId()}`;
    return this.http.delete(urlDelete)
      .pipe(
        catchError(this.handleError)
      );
  } */

  //delete
public DeleteCurrency(id): Observable<any> {
  const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  var urlDelete = `${environment.apiURL_Main + '/api/Currency/DeleteCurrency/' + id +'/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`;
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
