import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';

@Injectable({
  providedIn: 'root'
})
export class LinkingAccountsService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }
 
  public GetLinkingAccountsInitialForm(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/LinkingAccounts/GetLinkingAccountsInitailForm/' + this.jwtAuth.getLang()
      + '/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  
  public PostLinkingAccounts(post): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    debugger
    return this.http.post<any>(`${environment.apiURL_Main +'/api/LinkingAccounts/PostLinkingAccounts/'
      + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`, JSON.stringify(post), httpOptions)
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
