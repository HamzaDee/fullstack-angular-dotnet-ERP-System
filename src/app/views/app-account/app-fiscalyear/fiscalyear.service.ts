import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';

@Injectable({
  providedIn: 'root'
})
export class FiscalyearService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }
  public GetFiscalYearList(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/FiscalYear/GetFiscalYearList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }
  public GetFiscalYearInitailForm(id): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/FiscalYear/GetFiscalYearInitailForm/' + this.jwtAuth.getLang()
      + '/' + id + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }


  public OpenYear(id): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/CloseFiscalYear/OpenFiscalYear/' + this.jwtAuth.getCompanyId()
      + '/' +  this.jwtAuth.getUserId() + '/' + id} `)
      .pipe(
        catchError(this.handleError)
      )
  }

    //delete
    public DeleteFiscalYear(id): Observable<any> {
      debugger
      const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      var urlDelete = `${environment.apiURL_Main + '/api/FiscalYear/DeleteFiscalYear/' + id +'/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`;
      return this.http.post<any>(urlDelete,'',httpOptions)
        .pipe(
          catchError(this.handleError)
        );
    }


  public PostFiscalYear(post): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    debugger
    return this.http.post<any>(`${environment.apiURL_Main +'/api/FiscalYear/PostFiscalYear/'
      + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`, JSON.stringify(post), httpOptions)
  
      .pipe(
        catchError(this.handleError)
      )
  }

  public getYearNo(yearNo,Id): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/FiscalYear/GetYearNo/'+ yearNo + '/' + this.jwtAuth.getCompanyId()+ '/' + Id}`)
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
