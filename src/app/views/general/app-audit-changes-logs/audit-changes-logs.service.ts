import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
@Injectable({
  providedIn: 'root'
})
export class AuditChangesLogsService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }
  public GetInitialAdvancedSearchForm(): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/AuditChangesLog/GetInitialAdvancedSearchForm/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }
  public SearchForm(post): Observable<any> {
    return this.http.post<any>(`${environment.apiURL_Main + '/api/AuditChangesLog/SearchAuditChangesLog/' +
      this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId()+ '/' + this.jwtAuth.getUserId()}`, post)
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
