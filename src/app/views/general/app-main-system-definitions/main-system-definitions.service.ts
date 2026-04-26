import { Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpErrorResponse, HttpHeaders, HttpParams } from "@angular/common/http";
import { environment } from "environments/environment";
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { TranslateService } from '@ngx-translate/core';
@Injectable({
  providedIn: 'root'
})
export class MainSystemDefinitionsService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
    private translateServie: TranslateService
  ) { }
  public GetAllMainSystemsDefinitionList(): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/MainSystemDefinitions/GetMainSystemsDefinitionList/' +
      this.jwtAuth.getLang() + '/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`)
      .pipe(
        catchError(this.handleError)
      )
  }
  public GetMainSystemDefinitionListByTableNoList(tableNo): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/MainSystemDefinitions/GetMainSystemDefinitionListByTableNoList/' +
      this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + tableNo}`)
      .pipe(
        catchError(this.handleError)
      )
  }
  public PostMainSystemDefinition(post): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/MainSystemDefinitions/PostMainSystemDefinition/' +
      this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`, JSON.stringify(post), httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  public UpdatePaymentsTypes(): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/ListOfNewStudents/UpdatePaymentsTypes/' +
      this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`, httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  public InitailMainSystemsDefinition(id, tableNo): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/MainSystemDefinitions/GetInitialMainSystemDefinition/' + this.jwtAuth.getLang() + '/' + id +
      '/' + tableNo + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }
 /*  public DeleteMainSystemDefinition(id): Observable<any> {
    var urlDelete = `${environment.apiURL_Main + '/api/MainSystemDefinitions/DeleteMainSystemDefinition/' + id +
      '/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`;
    return this.http.delete(urlDelete)
      .pipe(
        catchError(this.handleError)
      );
  } */

  //delete
public DeleteMainSystemDefinition(id): Observable<any> {
  const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  var urlDelete = `${environment.apiURL_Main + '/api/MainSystemDefinitions/DeleteMainSystemDefinition/' + id +'/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`;
  return this.http.post<any>(urlDelete,'',httpOptions)
    .pipe(
      catchError(this.handleError)
    );
}

/////////
  public GetMianTableDropDownList(): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/MainSystemDefinitions/GetMianTableDropDownList/' +
      this.jwtAuth.getLang() +'/' + this.jwtAuth.getUserId()  + '/' + this.jwtAuth.getCompanyId}`)
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
