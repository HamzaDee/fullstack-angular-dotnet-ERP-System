import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectDefinitionService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }

public GetProjectsList(): Observable<any> {
  debugger
  return this.http.get(`${environment.apiURL_Main + '/api/ProjectDefinition/GetProjectsList/'
    + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
    .pipe(
      catchError(this.handleError)
    )
}

public SaveProject(post): Observable<any> {
  debugger
  const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  return this.http.post<any>(`${environment.apiURL_Main + '/api/ProjectDefinition/SaveProject/'
    + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,JSON.stringify(post),httpOptions)
    .pipe(
      catchError(this.handleError)
    )
}

public DeleteProject(Id): Observable<any> {
  const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  var urlDelete = `${environment.apiURL_Main + '/api/ProjectDefinition/DeleteProject/' + Id +'/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`;
  return this.http.post<any>(urlDelete,'',httpOptions)
    .pipe(
      catchError(this.handleError)
    );
}

public GetInitailProjectDefinition(Id,opType): Observable<any> {
  if(Id > 0){
    if(opType =='Show')
      {
        return this.http.get(`${environment.apiURL_Main + '/api/ProjectDefinition/ShowProjectDefinitionForm/' + this.jwtAuth.getLang() 
        + '/' + Id + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
        .pipe(
          catchError(this.handleError)
        )    
      }
      else
      {
        return this.http.get(`${environment.apiURL_Main + '/api/ProjectDefinition/EditProjectDefinitionForm/' + this.jwtAuth.getLang() 
      + '/' + Id + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )    
      }
        
  }
  else{
    return this.http.get(`${environment.apiURL_Main + '/api/ProjectDefinition/AddProjectDefinitionForm/' + this.jwtAuth.getLang() 
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
