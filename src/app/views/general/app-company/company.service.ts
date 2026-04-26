import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  loginModel: any;
  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }

  public CompanyList(): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/Company/CompanyList/' + this.jwtAuth.getLang() +
      '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`)
      .pipe(
        catchError(this.handleError)
      )
  }
  public PostCompany(post): Observable<any> {
    debugger
    return this.http.post<any>(`${environment.apiURL_Main + '/api/Company/PostCompany/' +
      this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`, post)
      .pipe(
        catchError(this.handleError)
      )
  }
  public GetInitialCompany(id): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/Company/GetInitialCompany/' + this.jwtAuth.getLang() + '/' + id
      +'/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()
    } `)
      .pipe(
        catchError(this.handleError)
      )
  }
/*   public DeleteCompany(id): Observable<any> {
    var urlDelete = `${environment.apiURL_Main + '/api/Company/DeleteCompany/' + id + '/' +
      this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`;
    return this.http.delete(urlDelete)
      .pipe(
        catchError(this.handleError)
      );
  } */

  //delete
public DeleteCompany(id): Observable<any> {
  const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  var urlDelete = `${environment.apiURL_Main + '/api/Company/DeleteCompany/' + id +'/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`;
  return this.http.post<any>(urlDelete,'',httpOptions)
    .pipe(
      catchError(this.handleError)
    );
}


  public getCompaniesDropDownListByUser(username, password): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/Company/GetCompaniesDropDownListByUser/'
      + this.jwtAuth.getLang()}`, { username, password }, httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }



  public UpdateFavourite(screenId):Observable<any>
  {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      return this.http.post(`${environment.apiURL_Main + '/api/General/UpdateFavourite/'
        + screenId + '/' + this.jwtAuth.getUserId() } `,null,httpOptions)
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
