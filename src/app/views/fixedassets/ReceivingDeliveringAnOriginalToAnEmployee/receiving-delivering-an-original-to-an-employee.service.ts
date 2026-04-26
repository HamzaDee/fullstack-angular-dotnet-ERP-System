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
export class ReceivingDeliveringAnOriginalToAnEmployeeService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
    private translateServie: TranslateService) { }



//..................................................................

public getReceivingDeliveringAnOriginalList(): Observable<any> {
        
  return this.http.get(`${environment.apiURL_Main + '/api/ReceivingDeliveringAnOriginalToAnEmployee/GetReceivingDeliveringAnOriginalList/' +
    this.jwtAuth.getLang() + '/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`)
    .pipe(
      catchError(this.handleError)
    )
}


public getReceivingDeliveringAnOriginalInfo(id,opType): Observable<any> {
  if(opType == "Show")
  {
  return this.http.get(`${environment.apiURL_Main + '/api/ReceivingDeliveringAnOriginalToAnEmployee/ShowReceivingDeliveringAnOrigina/' + this.jwtAuth.getLang() + '/' + id +
    '/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()} `)
    .pipe(
      catchError(this.handleError)
    )
  }
  else
  {
  return this.http.get(`${environment.apiURL_Main + '/api/ReceivingDeliveringAnOriginalToAnEmployee/GetReceivingDeliveringAnOriginalInfo/' + this.jwtAuth.getLang() + '/' + id +
    '/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()} `)
    .pipe(
      catchError(this.handleError)
    )
  }
}

public getOriginalConditioReceipt(id): Observable<any> {
  return this.http.get(`${environment.apiURL_Main + '/api/ReceivingDeliveringAnOriginalToAnEmployee/GetOriginalConditionReceipt/'+ this.jwtAuth.getLang() + '/' + id}`)
    .pipe(
      catchError(this.handleError)
    )
}


public saveReceivingDeliveringAnOriginal(post): Observable<any> {
        
  const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  return this.http.post<any>(`${environment.apiURL_Main + '/api/ReceivingDeliveringAnOriginalToAnEmployee/PostReceivingDeliveringAnOriginal/'
    + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,JSON.stringify(post),httpOptions)
    .pipe(
      catchError(this.handleError)
    )
}

/* public deleteReceivingDeliveringAnOriginalToAnEmployee(id): Observable<any> {
  var urlDelete = `${environment.apiURL_Main + '/api/ReceivingDeliveringAnOriginalToAnEmployee/DeleteReceivingDeliveringAnOriginalToAnEmployee/' + id +'/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`;
  return this.http.delete(urlDelete)
    .pipe(
      catchError(this.handleError)
    );
} */

    //delete
    public deleteReceivingDeliveringAnOriginalToAnEmployee(id): Observable<any> {
      const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      var urlDelete = `${environment.apiURL_Main + '/api/ReceivingDeliveringAnOriginalToAnEmployee/DeleteReceivingDeliveringAnOriginalToAnEmployee/' + id +'/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`;
      return this.http.post<any>(urlDelete,'',httpOptions)
        .pipe(
          catchError(this.handleError)
        );
    }

public getReceivingDeliveringAnOriginalToAnEmployeePrint(id): Observable<any> {
        
  return this.http.get(`${environment.apiURL_Main + '/api/ReceivingDeliveringAnOriginalToAnEmployee/GetReceivingDeliveringAnOriginalToAnEmployeePrint/' + this.jwtAuth.getLang() + '/' + id +
    '/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()} `)
    .pipe(
      catchError(this.handleError)
    )
}

//.................................................................. End
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
