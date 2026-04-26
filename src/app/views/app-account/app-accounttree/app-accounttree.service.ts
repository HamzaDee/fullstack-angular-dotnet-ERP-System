import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';

@Injectable({
  providedIn: 'root'
})
export class AccountTreeService {
  GetInitialCompany(RequstId: any) {
    throw new Error('Method not implemented.');
  }
  
  public GetAccountsList(parentAccId , accLevel) : Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/Account/GetAccountsList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + parentAccId + '/' + accLevel} `)
      .pipe(
        catchError(this.handleError)
      )
  }



  public GetSuspendedAccounts(parentAccId , accLevel) : Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/Account/GetSuspendedAccounts/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + parentAccId + '/' + accLevel} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public SearchAccounts(searchQuery) : Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/Account/SearchAccounts/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + searchQuery} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }
  
  public GetAccountTreeList(): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/Account/GetAccountsList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetInitialAccount(id): Observable<any> {
    debugger
    if(id > 0){
      return this.http.get(`${environment.apiURL_Main + '/api/Account/EditAccount/' + this.jwtAuth.getLang()
        + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()  + '/' + id} `)
      .pipe(
        catchError(this.handleError)
      )
    }
    else{
      return this.http.get(`${environment.apiURL_Main + '/api/Account/AddAccount/' + this.jwtAuth.getLang()
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()  + '/0' } `)
      .pipe(
        catchError(this.handleError)
      )
    }    
  }

  public GetInitialAccountBranch(id): Observable<any> {
    debugger
    if(id > 0){
      return this.http.get(`${environment.apiURL_Main + '/api/Account/AddMainAccountsBranch/' + this.jwtAuth.getLang()
        + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()  + '/' + id} `)
      .pipe(
        catchError(this.handleError)
      )
    }  
  }

/*   public DeleteAccount(id): Observable<any> {
    debugger
    var urlDelete = `${environment.apiURL_Main + '/api/Account/DeleteAccounts/' + id + '/'
      + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`;
    return this.http.delete(urlDelete)
      .pipe(
        catchError(this.handleError)
      );
  } */

      public DeleteAccount(id): Observable<any> {
        const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
        var urlDelete = `${environment.apiURL_Main + '/api/Account/DeleteAccounts/' + id +'/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`;
        return this.http.post<any>(urlDelete,'',httpOptions)
          .pipe(
            catchError(this.handleError)
          );
      }

  public PostAccount(post): Observable<any> {
    return this.http.post<any>(`${environment.apiURL_Main + '/api/Account/PostAccount/' +
      this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`, post)
      .pipe(
        catchError(this.handleError)
      )
  }
  
  public ImportFromExcel(post): Observable<any> {
    return this.http.post<any>(`${environment.apiURL_Main + '/api/Account/ImportFromExcel/' +
      this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`, post)
      .pipe(
        catchError(this.handleError)
      )
  }

  public PostAccountBranch(post): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/Account/MainAccountBranchForm/' + this.jwtAuth.getLang()
    + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() }`, JSON.stringify(post), httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetAccountNo(parentAccount): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/Account/GetAccountNumber/' +
    this.jwtAuth.getCompanyId() + '/' + parentAccount}`)
      .pipe(
        catchError(this.handleError)
      )
  }

  public IsValidAccountName(accId, accountName): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/Account/IsValidAccName/' +
    this.jwtAuth.getCompanyId() + '/' + accId + '/' + accountName}`)
      .pipe(
        catchError(this.handleError)
      )
  }

  public IsValidAccountNo(accId, accountNo): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/Account/IsValidAccountNo/' +
    this.jwtAuth.getCompanyId() + '/' + accId + '/' + accountNo}`)
      .pipe(
        catchError(this.handleError)
      )
  }


  public UpdateDashboredStatus(accId): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/Account/UpdateDashboredStatus/' +
       this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + accId}`)
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
