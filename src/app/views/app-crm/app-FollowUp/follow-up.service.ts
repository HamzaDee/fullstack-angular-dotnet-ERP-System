import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { environment } from 'environments/environment';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FollowUpService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }


  //List
  public GetFollowUpList(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/FollowUp/GetFollowUpList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }


  public GetGetInitailFollowUpForm(id): Observable<any> {
    if (id > 0) {
      return this.http.get(`${environment.apiURL_Main + '/api/FollowUp/GetFollowUpForm/' + this.jwtAuth.getLang()
        + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id} `)
        .pipe(
          catchError(this.handleError)
        )
    }
    else {
      return this.http.get(`${environment.apiURL_Main + '/api/FollowUp/GetFollowUpForm/' + this.jwtAuth.getLang()
        + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id} `)
        .pipe(
          catchError(this.handleError)
        )
    }
  }

  public saveFollowUp(post): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/FollowUp/SaveFollowUp/' + this.jwtAuth.getUserId() +
      '/' + this.jwtAuth.getCompanyId()}`, JSON.stringify(post), httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

public CancelFollowUp(id): Observable<any> {
  const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  var urlDelete = `${environment.apiURL_Main + '/api/FollowUp/CancelFollowUp/' + this.jwtAuth.getCompanyId() +'/' + this.jwtAuth.getUserId() + '/' + id}`;
  return this.http.post<any>(urlDelete,'',httpOptions)
    .pipe(
      catchError(this.handleError)
    );
}

public CloseFollowUp(id): Observable<any> {
  const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  var urlDelete = `${environment.apiURL_Main + '/api/FollowUp/CloseFollowUp/' + this.jwtAuth.getCompanyId() +'/' + this.jwtAuth.getUserId() + '/' + id}`;
  return this.http.post<any>(urlDelete,'',httpOptions)
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

  private handleError = (error: HttpErrorResponse) => {
    debugger;

    if (error.error instanceof ErrorEvent) {
      console.log(error.error.message);
    } else {
      console.log(error.status);
    }

    console.log('Something is wrong!');
    return throwError(() => error);
  };
}
