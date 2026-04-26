import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
@Injectable({
  providedIn: 'root'
})
export class AccountsBudgetsService {
  loginModel: any;
  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }

  public GetAccountsbudgetsList(): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/Budget/GetAccountsBudgetsList/' + this.jwtAuth.getLang() +
      '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`)
      .pipe(
        catchError(this.handleError)
      )
  }
  public PostAccountsbudgets(post): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/Budget/PostAccountsBudgets/' + this.jwtAuth.getUserId() + 
    '/' + this.jwtAuth.getCompanyId()}`, JSON.stringify(post), httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }
  public GetAccountsbudgetsInitialForm(id): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/Budget/GetAccountsBudgetsInitailForm/' + this.jwtAuth.getLang() + '/' + id + '/' + this.jwtAuth.getCompanyId()
      + '/' +  this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }
  public DeleteAccountsBudgets(id): Observable<any> {
    var urlDelete = `${environment.apiURL_Main + '/api/CompanyBranch/DeleteCompanyBranch/' + id + '/' +
      this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`;
    return this.http.delete(urlDelete)
      .pipe(
        catchError(this.handleError)
      );
  }
  public GetBranchByCompanyId(companyId): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/CompanyBranch/GetBranchByCompanyId/' + this.jwtAuth.getLang()
      + '/' + companyId} `)
      .pipe(
        catchError(this.handleError)
      )
  }


  public GetAccounts(): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/Budget/GetAccountsBudgetsInitailForm/' + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId()
    + '/' + this.jwtAuth.getUserId() } `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public CheckIfExistAccountId(accountId,yearId): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/Budget/CheckIFExistAccountId/' + this.jwtAuth.getCompanyId()
    + '/' + accountId + '/' + yearId} `)
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
