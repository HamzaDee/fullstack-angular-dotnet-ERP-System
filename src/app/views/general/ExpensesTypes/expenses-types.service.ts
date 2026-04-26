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
export class ExpensesTypesService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
    private translateServie: TranslateService) { }


//List
public getExpensesTypesList(): Observable<any> {
  return this.http.get(`${environment.apiURL_Main + '/api/ExpensesTypes/GetExpensesTypesList/'
    + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
    .pipe(
      catchError(this.handleError)
    )
}

// get
public getExpensesTypesForm(id): Observable<any> {
  return this.http.get(`${environment.apiURL_Main + '/api/ExpensesTypes/GetExpensesTypesForm/' + this.jwtAuth.getLang()
    + '/' + id + '/' + this.jwtAuth.getCompanyId()+ '/' + this.jwtAuth.getUserId()} `)
    .pipe(
      catchError(this.handleError)
    )
}

// post
public postExpensesType(post): Observable<any> {
  const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  return this.http.post<any>(`${environment.apiURL_Main + '/api/ExpensesTypes/PostExpensesType/'
    + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`, JSON.stringify(post), httpOptions)
    .pipe(
      catchError(this.handleError)
    )
}

//Delete
/* public deleteExpensesType(id): Observable<any> {
  var urlDelete = `${environment.apiURL_Main + '/api/ExpensesTypes/DeleteExpensesType/' + id + '/'
    + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`;
  return this.http.delete(urlDelete)
    .pipe(
      catchError(this.handleError)
    );
} */

//delete
public deleteExpensesType(id): Observable<any> {
  const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  var urlDelete = `${environment.apiURL_Main + '/api/ExpensesTypes/DeleteExpensesType/' + id +'/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`;
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
      if (error.error instanceof ErrorEvent) {
          console.log(error.error.message)
      } else {
          console.log(error.status)
      }
      return throwError(
          console.log('Something is wrong!'));
  }
}
