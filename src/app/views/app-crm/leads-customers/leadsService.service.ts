import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { environment } from 'environments/environment';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LeadsService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
    private translateServie: TranslateService) { }

  public GetLeadsCustomerList(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/LeadsCustomers/GetLeadsCustomerList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetGetInitailLeadsCustomersForm(id, opType): Observable<any> {
    if (id > 0) {
      if (opType == 'Show') {
        return this.http.get(`${environment.apiURL_Main + '/api/LeadsCustomers/ShowLeadsCustomer/' + this.jwtAuth.getLang()
          + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id} `)
          .pipe(
            catchError(this.handleError)
          )
      }
      else {
        return this.http.get(`${environment.apiURL_Main + '/api/LeadsCustomers/EditLeadsCustomer/' + this.jwtAuth.getLang()
          + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id} `)
          .pipe(
            catchError(this.handleError)
          )
      }
    }
    else {
      return this.http.get(`${environment.apiURL_Main + '/api/LeadsCustomers/AddLeadsCustomerInfo/' + this.jwtAuth.getLang()
        + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id} `)
        .pipe(
          catchError(this.handleError)
        )
    }
  }

  public saveLeadsCustomer(post): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/LeadsCustomers/SaveLeadsCustomer/'
      + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `, JSON.stringify(post), httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  public deleteLeadsCustomers(Id): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    var urlDelete = `${environment.apiURL_Main + '/api/LeadsCustomers/DeleteLeadsCustomers/' + Id + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`;
    return this.http.post<any>(urlDelete, '', httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  public UpdateFavourite(screenId): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post(`${environment.apiURL_Main + '/api/General/UpdateFavourite/'
      + screenId + '/' + this.jwtAuth.getUserId()} `, null, httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetFavouriteStatus(screenId): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/General/GetFavouriteStatus/' + screenId + '/' + this.jwtAuth.getUserId()} `)
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
