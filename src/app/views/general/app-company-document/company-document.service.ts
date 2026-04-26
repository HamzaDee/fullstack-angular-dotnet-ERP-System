import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse,HttpHeaders } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
@Injectable({
  providedIn: 'root'
})
export class CompanyDocumentService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }
  public GetCompanyDocumentList(): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/CompanyDocument/GetCompanyDocumentList/' + this.jwtAuth.getLang() +
      '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`)
      .pipe(
        catchError(this.handleError)
      )
  }
  public CompanyDocumentPost(post): Observable<any> {
    return this.http.post<any>(`${environment.apiURL_Main + '/api/CompanyDocument/CompanyDocumentPost/' +
      this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`, post)
      .pipe(
        catchError(this.handleError)
      )
  }
  public GetInitialCompnayDocumentForm(id): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/CompanyDocument/GetInitialCompnayDocumentForm/' +
      this.jwtAuth.getLang() + '/' + id +'/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }
 /*  public DeleteCompnayDocument(id): Observable<any> {
    var urlDelete = `${environment.apiURL_Main + '/api/CompanyDocument/DeleteCompnayDocument/' + id + '/' +
      this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`;
    return this.http.delete(urlDelete)
      .pipe(
        catchError(this.handleError)
      );
  } */

  //delete
public DeleteCompnayDocument(id): Observable<any> {
  const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  var urlDelete = `${environment.apiURL_Main + '/api/CompanyDocument/DeleteCompnayDocument/' + id +'/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`;
  return this.http.post<any>(urlDelete,'',httpOptions)
    .pipe(
      catchError(this.handleError)
    );
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
