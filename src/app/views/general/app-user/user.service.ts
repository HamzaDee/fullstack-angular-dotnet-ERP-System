import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { TranslateService } from '@ngx-translate/core';
@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
    private translateServie: TranslateService
  ) { }

  //#region UserMessages
  public GetUserMessagesList(): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/User/GetUserMessagesList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }
  public UserMessageInitialForm(id): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/User/GetUserMessageInitialForm/' + this.jwtAuth.getLang()
      + '/' + id + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }
  public UserMessageInitialDetialsForm(id): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/User/GetUserMessageInitialDetialsForm/' + this.jwtAuth.getLang()
      + '/' + id + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

    //delete
    public DeleteUserMessage(id): Observable<any> {
      const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      var urlDelete = `${environment.apiURL_Main + '/api/User/DeleteUserMessage/' + id +'/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`;
      return this.http.post<any>(urlDelete,'',httpOptions)
        .pipe(
          catchError(this.handleError)
        );
    }

  public PostUserMessage(post): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/User/PostUserMessage/'+ this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`, JSON.stringify(post), httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }
  //#endregion UserMessages
  //#region UserDefinition
  public GetUserDefinitionList(): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/User/GetUserDefinitionList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }
  public GetUserGroupList(id): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/User/GetUserGroupList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + id} `)
      .pipe(
        catchError(this.handleError)
      )
  }
  public GetUserInitailForm(id): Observable<any> {
    // if(id > 0)
    //   {
    //     return this.http.get(`${environment.apiURL_Main + '/api/User/GetUserInitailFormById/' +  id + '/' + this.jwtAuth.getCompanyId()} `)
    //       .pipe(
    //         catchError(this.handleError)
    //       )
    //   }
    //   else
    //   {
        return this.http.get(`${environment.apiURL_Main + '/api/User/GetUserInitailForm/' + this.jwtAuth.getLang()
          + '/' + id + '/' + this.jwtAuth.getCompanyId()+ '/' + this.jwtAuth.getUserId()} `)
          .pipe(
            catchError(this.handleError)
          )
      // }
    
  }
  // public DeleteUser(id): Observable<any> {
  //   var urlDelete = `${environment.apiURL_Main + '/api/User/DeleteUser/' + id + '/'
  //     + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`;
  //   return this.http.delete(urlDelete)
  //     .pipe(
  //       catchError(this.handleError)
  //     );
  // } 

                //delete
    public DeleteUser(id): Observable<any> {
      const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      var urlDelete = `${environment.apiURL_Main + '/api/User/DeleteUser/' + id + '/'
        + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId() }`;
      return this.http.post<any>(urlDelete,'',httpOptions)
        .pipe(
          catchError(this.handleError)
        );
    }

  public PostUser(post): Observable<any> {
    return this.http.post<any>(`${environment.apiURL_Main + '/api/User/PostUser/' +
      this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`, post)
      .pipe(
        catchError(this.handleError)
      )
  }
  public Changepassord(post): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/User/Changepassord'}`, JSON.stringify(post), httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }


  public UpdateStatus(id,status):Observable<any>
{
  const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post(`${environment.apiURL_Main + '/api/User/UpdateStatus/'
      + id + '/' + this.jwtAuth.getCompanyId() + '/' + status} `,null,httpOptions)
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

  //#endregion UserDefinition
  //.........User Company

  //list
  public GetUsersCompany(id): Observable<any> {
          
    return this.http.get(`${environment.apiURL_Main + '/api/User/UsersCompany/' +
      this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + id}`)
      .pipe(
        catchError(this.handleError)
      )
  }

  public SaveUsersCompany(post): Observable<any> {
          
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/User/PostUsersCompany/'
      + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,post,httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }
  //....... End User Company
//#region  UserPermission
public GetUserPermissionForm(userId): Observable<any> {
  if(userId != null && userId != undefined && userId != 0)
    {
      return this.http.get(`${environment.apiURL_Main + '/api/User/GetUserPermissionForm/' + this.jwtAuth.getLang()
        + '/' + this.jwtAuth.getCompanyId() + '/' + userId} `)
        .pipe(
          catchError(this.handleError)
        )
    } 
    else
    {

      return this.http.get(`${environment.apiURL_Main + '/api/User/GetUserPermissionForm/' + this.jwtAuth.getLang()
        + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
        .pipe(
          catchError(this.handleError)
        )
    }  
}

public GetPermissionsListByUserAndScreen(userId,screenId): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/User/GetPermissionsListByUserAndScreen/' + userId
      + '/' + this.jwtAuth.getCompanyId() + '/' + screenId  + '/' + this.jwtAuth.getLang()} `)
      .pipe(
        catchError(this.handleError)
      )    
}


// public SaveUserPermissions(post): Observable<any> {
//   debugger
//   const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
//   return this.http.post<any>(`${environment.apiURL_Main + '/api/User/SaveUserPermissions/'
//     + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,post,httpOptions)
//     .pipe(
//       catchError(this.handleError)
//     )
// }


public SaveUserPermissions(post): Observable<any> {
  debugger
  const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  return this.http.post<any>(`${environment.apiURL_Main + '/api/User/SaveUserPermissions/'
    + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,JSON.stringify(post),httpOptions)
    .pipe(
      catchError(this.handleError)
    )
}




public GetPermissionsListByUserAndGroup(userId,groupId): Observable<any> {
  if(userId != "" && groupId !="")
    {
      return this.http.get(`${environment.apiURL_Main + '/api/User/GetPermissionsListByUserAndGroup/' + this.jwtAuth.getCompanyId()
        + '/' + userId + '/' + groupId + '/' + this.jwtAuth.getLang()} `)
        .pipe(
          catchError(this.handleError)
        ) 
    }
    else if(userId == "")
      {
        return this.http.get(`${environment.apiURL_Main + '/api/User/GetPermissionsListByUserAndGroup/' + this.jwtAuth.getCompanyId()
          + '/' + "," + '/' + groupId + '/' + this.jwtAuth.getLang()} `)
          .pipe(
            catchError(this.handleError)
          ) 
      }
      else
      {
        return this.http.get(`${environment.apiURL_Main + '/api/User/GetPermissionsListByUserAndGroup/' + this.jwtAuth.getCompanyId()
          + '/' + userId + '/' + "," + '/' + this.jwtAuth.getLang()} `)
          .pipe(
            catchError(this.handleError)
          ) 
      }
     
}

//#endregion
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
