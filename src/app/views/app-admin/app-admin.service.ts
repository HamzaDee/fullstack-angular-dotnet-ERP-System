import { Injectable } from "@angular/core";
import {throwError as observableThrowError,  Observable, throwError } from 'rxjs';
import { of, combineLatest } from 'rxjs';
import { startWith, debounceTime, delay, map, switchMap, catchError } from 'rxjs/operators';
import { DropDownModel } from "app/shared/models/DropDownModel";
import { environment } from "environments/environment";
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { JwtAuthService } from "app/shared/services/auth/jwt-auth.service";
import { PermissionModel } from "app/shared/models/PermissionModel";
import { post } from "jquery";

interface IItem {
  id: string;
  username: string;
}



@Injectable()
export class AppAdminService {
  
 
  constructor(    private http: HttpClient,    private jwtAuth: JwtAuthService,

    ) { }
 
  public getUsersBySearch(search:string): Observable<Array<DropDownModel>> {
        return this.http.get(`${environment.apiURL_Main}`+'/api/Permission/GetUserListBySearch/'+this.jwtAuth.getLang()+'/'+ search)
      .pipe(
        delay(0),
        map((data: Array<DropDownModel>) => {
          return data;
        })
      )
  }
  public getUserPermission(id:string,moduleId:string,screenId:string): Observable<Array<PermissionModel>> {
    return this.http.get(`${environment.apiURL_Main}`+'/api/Permission/GetUserPermission/'+this.jwtAuth.getLang()+'/'+ moduleId+'/'+ screenId+'/'+ id)
  .pipe(
    delay(1000),
    map((data: Array<PermissionModel>) => {
      return data;
    })
  )
}
  public getMainModule(): Observable<Array<DropDownModel>> {
    return this.http.get(`${environment.apiURL_Main}`+'/api/Permission/GetMainModules/'+this.jwtAuth.getLang())
  .pipe(
    delay(0),
    map((data: Array<DropDownModel>) => {
      return data;
    })
  )
}
public getScreensByMainModule(id:string): Observable<Array<DropDownModel>> {
  return this.http.get(`${environment.apiURL_Main}`+'/api/Permission/GetScreensByModuleNo/'+this.jwtAuth.getLang()+'/'+id)
.pipe(
  delay(0),
  map((data: Array<DropDownModel>) => {
    return data;
  })
)
}
public createUserPermission(data): Observable<Array<PermissionModel>> {
  const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  return this.http.post<Array<PermissionModel>>(`${environment.apiURL_Main + '/api/Permission/CreateUserPermission'}`, JSON.stringify(data),httpOptions)

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
};
}


