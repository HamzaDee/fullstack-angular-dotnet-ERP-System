import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from "@angular/common/http";
import { environment } from "environments/environment";
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
    providedIn: 'root'
})
export class ItemsGroupService {

    constructor(private http: HttpClient,
        private jwtAuth: JwtAuthService,
        private translateServie: TranslateService
    ) { }

    public GetAllItemsGroups(): Observable<any> {
        debugger
        return this.http.get(`${environment.apiURL_Main + '/api/ItemsGroups/GetAllItemsGroups/' + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`)
    }


    public InitailItemsGroups(id,opType): Observable<any> {
    if(id > 0){
      if(opType == 'Show')
        {
         return this.http.get(`${environment.apiURL_Main + '/api/ItemsGroups/ShowInitialItemsGroups/' + this.jwtAuth.getLang() 
        + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id } `)
        .pipe(
          catchError(this.handleError)
        )
        }
      else{
        return this.http.get(`${environment.apiURL_Main + '/api/ItemsGroups/EditInitialItemsGroups/' + this.jwtAuth.getLang() 
        + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id } `)
        .pipe(
          catchError(this.handleError)
        )
      }
    }
    else{
      return this.http.get(`${environment.apiURL_Main + '/api/ItemsGroups/GetInitialItemsGroups/' + this.jwtAuth.getLang() 
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id} `)
        .pipe(
          catchError(this.handleError)
        )
    }   
  }
    // public InitailItemsGroups(id): Observable<any> {
    //     return this.http.get(`${environment.apiURL_Main + '/api/ItemsGroups/GetInitialItemsGroups/' + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id}`)
    // }
    public GetMaxIdItemsGroups(id): Observable<any> {
        return this.http.get(`${environment.apiURL_Main + '/api/ItemsGroups/GetMaxIdItemsGroups/' + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id}`)
    }
    public GetInfoByMainGroupId(mainGroupId): Observable<any> {
        return this.http.get(`${environment.apiURL_Main + '/api/ItemsGroups/GetInfoByMainGroupId/' + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + mainGroupId}`)
    }

    public GetItemsGroupsBranchs(id): Observable<any> {
        return this.http.get(`${environment.apiURL_Main + '/api/ItemsGroups/GetItemsGroupsBranchs/' + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id}`)
    }

    public AddItemsGroups(post): Observable<any> {
        return this.http.post<any>(`${environment.apiURL_Main + '/api/ItemsGroups/PostItemsGroups/' + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`, post)
    }

    public PostItemsGroupsBranches(post): Observable<any> {
        return this.http.post<any>(`${environment.apiURL_Main + '/api/ItemsGroups/PostItemsGroupsBranches/' + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`, post)
    }

/*     public DeleteItemsGroups(id): Observable<any> {
        return this.http.delete(`${environment.apiURL_Main + '/api/ItemsGroups/DeleteItemsGroups/' + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id}`);
    } */


            //delete
    public DeleteItemsGroups(id): Observable<any> {
        const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
        var urlDelete = `${environment.apiURL_Main + '/api/ItemsGroups/DeleteItemsGroups/' + this.jwtAuth.getLang() +'/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()+ '/' + id}`;
        return this.http.post<any>(urlDelete,'',httpOptions)
          .pipe(
            catchError(this.handleError)
          );
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
