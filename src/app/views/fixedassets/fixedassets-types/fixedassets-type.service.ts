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
export class FixedassetsTypeService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
    private translateServie: TranslateService) { }

// ............................. Fixed Assest Types

  public getFixedAssetsTypeList(): Observable<any> {
    
    return this.http.get(`${environment.apiURL_Main + '/api/FixedAssetsType/GetFixedAssetsTypeList/' +
      this.jwtAuth.getLang() + '/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`)
      .pipe(
        catchError(this.handleError)
      )
  }


  public getFixedAssetsTypeInfo(id): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/FixedAssetsType/GetFixedAssetsTypeInfo/' + this.jwtAuth.getLang() + '/' + id +
      '/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public SaveFixedAssetsType(post): Observable<any> {
    
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/FixedAssetsType/PostFixedAssetsType/' + this.jwtAuth.getUserId() + 
    '/' + this.jwtAuth.getCompanyId()}`, JSON.stringify(post), httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }



 /*  public deleteFixedAssetsType(id): Observable<any> {
    var urlDelete = `${environment.apiURL_Main + '/api/FixedAssetsType/DeleteFixedAssetsType/' + id +'/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`;
    return this.http.delete(urlDelete)
      .pipe(
        catchError(this.handleError)
      );
  } */

    //delete
public deleteFixedAssetsType(id): Observable<any> {
  const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  var urlDelete = `${environment.apiURL_Main + '/api/FixedAssetsType/DeleteFixedAssetsType/' + id +'/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`;
  return this.http.post<any>(urlDelete,'',httpOptions)
    .pipe(
      catchError(this.handleError)
    );
}

  public getMainTypeInfo(MainTypeId): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/FixedAssetsType/GetMainTypeInfo/' + MainTypeId}`)
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

  //.............................. End Fixed Assest Types 

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
