import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
@Injectable({
  providedIn: 'root'
})
export class UsersGroupsService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }
  public GetUesrGrouptList(): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/UsersGroups/GetUesrGrouptList/' +
      this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`)
      .pipe(
        catchError(this.handleError)
      )
  }
  public PostUesrGroup(post): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/UsersGroups/PostUesrGroup/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`
      , JSON.stringify(post), httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }
  public GetUesrGroupInitialForm(id): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/UsersGroups/GetUesrGroupInitialForm/' + id + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }
/*   public DeleteUesrGroup(id): Observable<any> {
    var urlDelete = `${environment.apiURL_Main + '/api/UsersGroups/DeleteUesrGroup/' + id + '/' + this.jwtAuth.getUserId()
      + '/' + this.jwtAuth.getCompanyId()}`;
    return this.http.delete(urlDelete)
      .pipe(
        catchError(this.handleError)
      );
  } */

//delete
public DeleteUesrGroup(id): Observable<any> {
  const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  var urlDelete = `${environment.apiURL_Main + '/api/UsersGroups/DeleteUesrGroup/' + id +'/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`;
  return this.http.post<any>(urlDelete,'',httpOptions)
    .pipe(
      catchError(this.handleError)
    );
}

  public GetGroupsByCompanyId(companyId): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/UsersGroups/GetGroupsByCompanyId/' + this.jwtAuth.getLang()
      + '/' + companyId} `)
      .pipe(
        catchError(this.handleError)
      )
  }

//#region  Permissions Add By Hamza
  public GetUserGroupPermissionForm(groupId): Observable<any> {
    debugger
    // if(groupId != null && groupId != undefined && groupId != 0)
    //   {
        return this.http.get(`${environment.apiURL_Main + '/api/UsersGroups/GetUserGroupPermissionForm/' + this.jwtAuth.getLang()
          + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + groupId} `)
          .pipe(
            catchError(this.handleError)
          )
      // } 
      // else
      // {  
      //   return this.http.get(`${environment.apiURL_Main + '/api/UsersGroups/GetUserGroupPermissionForm/' + this.jwtAuth.getLang()
      //     + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      //     .pipe(
      //       catchError(this.handleError)
      //     )
      // }  
  }
  public GetPermissionsListByGroupAndScreen(GroupId,screenId): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/UsersGroups/GetPermissionsListByGroupAndScreen/' + GroupId
      + '/' + this.jwtAuth.getCompanyId() + '/' + screenId} `)
      .pipe(
        catchError(this.handleError)
      )    
}

public SaveGroupPermissions(post): Observable<any> {
        
  const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  return this.http.post<any>(`${environment.apiURL_Main + '/api/UsersGroups/SaveGroupPermissions/'
    + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,post,httpOptions)
    .pipe(
      catchError(this.handleError)
    )
}
//#endregion

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
