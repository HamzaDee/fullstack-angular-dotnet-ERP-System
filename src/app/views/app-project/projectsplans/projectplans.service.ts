import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectPlansService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }

public GetProjectsPlansList(): Observable<any> {
  debugger
  return this.http.get(`${environment.apiURL_Main + '/api/ProjectsPlans/GetProjectsPlansList/'
    + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
    .pipe(
      catchError(this.handleError)
    )
}

public SaveProjectPlan(post): Observable<any> {
  debugger
  const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  return this.http.post<any>(`${environment.apiURL_Main + '/api/ProjectsPlans/SaveProjectPlan/'
    + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,JSON.stringify(post),httpOptions)
    .pipe(
      catchError(this.handleError)
    )
}

public DeleteProjectPlan(Id): Observable<any> {
  const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  var urlDelete = `${environment.apiURL_Main + '/api/ProjectsPlans/DeleteProjectPlan/' + Id +'/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`;
  return this.http.post<any>(urlDelete,'',httpOptions)
    .pipe(
      catchError(this.handleError)
    );
}

public GetInitailProjectPlans(Id,opType): Observable<any> {
  debugger
  if(Id > 0){
    if(opType =='Show')
      {
        return this.http.get(`${environment.apiURL_Main + '/api/ProjectsPlans/ShowProjectPlanForm/' + this.jwtAuth.getLang() 
        + '/' + Id + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
        .pipe(
          catchError(this.handleError)
        )    
      }
      else
      {
        return this.http.get(`${environment.apiURL_Main + '/api/ProjectsPlans/EditProjectPlanForm/' + this.jwtAuth.getLang() 
      + '/' + Id + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )    
      }
        
  }
  else{
    return this.http.get(`${environment.apiURL_Main + '/api/ProjectsPlans/AddProjectsPlansForm/' + this.jwtAuth.getLang() 
    + '/' + Id + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }   
}


public GetProjectData(ProjectId): Observable<any> 
{
 return this.http.get(`${environment.apiURL_Main + '/api/ProjectsPlans/GetProjectData/' + this.jwtAuth.getCompanyId() + '/' + ProjectId } `).pipe(
        catchError(this.handleError)
      )

}


public ImportFromExcel(post): Observable<any> {
  return this.http.post<any>(`${environment.apiURL_Main + '/api/ProjectsPlans/ImportFromExcel/' +
    this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`, post)
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
