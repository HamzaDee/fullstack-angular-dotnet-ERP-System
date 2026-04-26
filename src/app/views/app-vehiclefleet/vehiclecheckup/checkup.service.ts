import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';

@Injectable({
  providedIn: 'root'
})
export class CheckUpService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }

public GetCheckUpList(): Observable<any> {
  debugger
  return this.http.get(`${environment.apiURL_Main + '/api/CheckUp/GetCheckUpList/'
    + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
    .pipe(
      catchError(this.handleError)
    )
}

public SaveCheckUps(post): Observable<any> {
  debugger
  const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  return this.http.post<any>(`${environment.apiURL_Main + '/api/CheckUp/SaveCheckUps/'
    + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,JSON.stringify(post),httpOptions)
    .pipe(
      catchError(this.handleError)
    )
}

public DeleteCheckUps(Id): Observable<any> {
  const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  let urlDelete = `${environment.apiURL_Main + '/api/CheckUp/DeleteCheckUps/' + Id +'/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`;
  return this.http.post<any>(urlDelete,'',httpOptions)
    .pipe(
      catchError(this.handleError)
    );
}

public GetInitailCheckUp(Id,opType): Observable<any> {
  if(Id > 0){
    if(opType == 'Show')
      {
        return this.http.get(`${environment.apiURL_Main + '/api/CheckUp/ShowCheckUpForm/' + this.jwtAuth.getLang() 
        + '/' + Id + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
        .pipe(
          catchError(this.handleError)
        )      
      }
      else
      {
        return this.http.get(`${environment.apiURL_Main + '/api/CheckUp/EditCheckUpForm/' + this.jwtAuth.getLang() 
        + '/' + Id + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
        .pipe(
          catchError(this.handleError)
        )      
      }
      
  }
  else{
    return this.http.get(`${environment.apiURL_Main + '/api/CheckUp/AddCheckUpForm/' + this.jwtAuth.getLang() 
    + '/' + Id + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }   
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
