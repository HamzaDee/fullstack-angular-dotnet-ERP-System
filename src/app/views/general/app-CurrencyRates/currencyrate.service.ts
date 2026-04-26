import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { environment } from 'environments/environment';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CurrencyrateService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService) { }

//list
public GetCurrencyRateList(): Observable<any> {
        
  return this.http.get(`${environment.apiURL_Main + '/api/CurrencyRate/GetCurrencyRateList/' +
    this.jwtAuth.getLang() + '/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`)
    .pipe(
      catchError(this.handleError)
    )
}

// get 
public GetCurrencyRateInfo(id): Observable<any> {
  return this.http.get(`${environment.apiURL_Main + '/api/CurrencyRate/GetCurrencyRate/' + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() +
  '/' + this.jwtAuth.getUserId() + '/' + id}`)
  .pipe(
    catchError(this.handleError)
  )
}

// save 
public saveCurrencyRateForm(post): Observable<any> {  
  const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  return this.http.post<any>(`${environment.apiURL_Main + '/api/CurrencyRate/PostCurrencyRate/'
    + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,post)
    .pipe(
      catchError(this.handleError)
    )
}

    //delete
    public deleteCurrencyRate(id): Observable<any> {
      const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      var urlDelete = `${environment.apiURL_Main + '/api/CurrencyRate/DeleteCurrencyRate/' + id +'/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`;
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
