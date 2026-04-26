import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { environment } from 'environments/environment';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthoritiesService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
    private translateServie: TranslateService) { }


  public getAuthoritiesList(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/Authorities/GetAuthoritiesList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }
  
    public getAuthoritiesModelInfo(id,opType): Observable<any> {
      if(id > 0)
        {
          if(opType == 'Show')
            {
              return this.http.get(`${environment.apiURL_Main + '/api/Authorities/ShowAuthoritiesModelInfo/' + this.jwtAuth.getLang()
              + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id} `)
              .pipe(
                catchError(this.handleError)
              )
            }
            else
            {
              return this.http.get(`${environment.apiURL_Main + '/api/Authorities/EditAuthoritiesModelInfo/' + this.jwtAuth.getLang()
              + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id} `)
              .pipe(
                catchError(this.handleError)
              )
            }
        }
        else
        {
          return this.http.get(`${environment.apiURL_Main + '/api/Authorities/AddAuthoritiesModelInfo/' + this.jwtAuth.getLang()
          + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id} `)
          .pipe(
            catchError(this.handleError)
          )
        }
    }


    public saveAuthorities(post): Observable<any> {        
      const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      return this.http.post<any>(`${environment.apiURL_Main + '/api/Authorities/PostAuthorities/'
        + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,JSON.stringify(post),httpOptions)
        .pipe(
          catchError(this.handleError)
        )
    }


    public saveAuthoritiesEvaluation(post): Observable<any> {        
      const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      return this.http.post<any>(`${environment.apiURL_Main + '/api/Authorities/saveAuthoritiesEvaluation/'
        + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,JSON.stringify(post),httpOptions)
        .pipe(
          catchError(this.handleError)
        )
    }


    public getAuthEvaluationDTModelInfo(id): Observable<any> {
      return this.http.get(`${environment.apiURL_Main + '/api/Authorities/GetAuthEvaluationDTModelInfo/' + this.jwtAuth.getLang()
        + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id} `)
        .pipe(
          catchError(this.handleError)
        )
    }



      public deleteAuthorities(id): Observable<any> {
        const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
        var urlDelete = `${environment.apiURL_Main + '/api/Authorities/DeleteAuthorities/' + id +'/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`;
        return this.http.post<any>(urlDelete,'',httpOptions)
          .pipe(
            catchError(this.handleError)
          );
      }


      public deleteAuthoEvaluation(id): Observable<any> {
        const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
        var urlDelete = `${environment.apiURL_Main + '/api/Authorities/DeleteAuthoEvaluation/' + id +'/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`;
        return this.http.post<any>(urlDelete,'',httpOptions)
          .pipe(
            catchError(this.handleError)
          );
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
