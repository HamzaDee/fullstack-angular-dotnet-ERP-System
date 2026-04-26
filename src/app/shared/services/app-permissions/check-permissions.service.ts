import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError, } from 'rxjs/operators';
import { JwtAuthService } from '../auth/jwt-auth.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: "root",
})
export class CheckPermissionsService {
  constructor(private http: HttpClient, private jwtAuth: JwtAuthService, private router: Router) {
  }
  isAuth = false

  public CheckPermissions(actionId, screenId): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/permission/checkUserPermissions/' + this.jwtAuth.getUserId() + '/' + screenId + '/' + actionId}`)
      .pipe(
        catchError(this.handleError)
      )
  }
  public CheckStatePermissions(screenId): Observable<any> {




    return this.http.get(`${environment.apiURL_Main + '/api/permission/checkUserStatePermissions/' + screenId + '/' + this.jwtAuth.getUserId()}`)
      .pipe(
        catchError(this.handleError)
      )
  }


  public canActivePage(screenId): void {
    let SessionUserId = sessionStorage.getItem('UserId')
    if (SessionUserId != this.jwtAuth.getUserId()) {
      sessionStorage.setItem('UserId', this.jwtAuth.getUserId())
      if (SessionUserId != null) {
        window.location.reload();
      }
    }
    this.CheckStatePermissions(screenId).subscribe(
      (data) => {
        if (data !== true) {
          this.jwtAuth.signout();
          this.router.navigate(["Account/Login"]);

        }
      },
      (error) => {
        this.jwtAuth.signout();
        this.router.navigate(["Account/Login"]);


      }
    );

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

