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
export class AppStoresService {
    constructor(
        private http: HttpClient,
        private jwtAuth: JwtAuthService,
        private translateServie: TranslateService
    ) { }

    public GetAllStores(): Observable<any> {
        return this.http.get(`${environment.apiURL_Main + '/api/Store/GetAllStores/' + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`)
    }


    public InitailStore(id,opType): Observable<any> {
    if(id > 0){
      if(opType == 'Show')
        {
         return this.http.get(`${environment.apiURL_Main + '/api/Store/ShowInitialStore/' + this.jwtAuth.getLang() 
        + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id } `)
        .pipe(
          catchError(this.handleError)
        )
        }
      else{
        return this.http.get(`${environment.apiURL_Main + '/api/Store/EditInitialStore/' + this.jwtAuth.getLang() 
        + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id } `)
        .pipe(
          catchError(this.handleError)
        )
      }
    }
    else{
      return this.http.get(`${environment.apiURL_Main + '/api/Store/GetInitialStore/' + this.jwtAuth.getLang() 
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id} `)
        .pipe(
          catchError(this.handleError)
        )
    }   
  }


    public GetStoreLists(): Observable<any> {
        return this.http.get(`${environment.apiURL_Main + '/api/Store/GetStoreLists/' + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId()}`);
    }

     public AddStore(post): Observable<any> {
        return this.http.post<any>(`${environment.apiURL_Main + '/api/Store/PostStore/' + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`, post)
    } 

    public UpdateUsers(post, id): Observable<any> {
        return this.http.post<any>(`${environment.apiURL_Main + '/api/Store/UpdateUsers/' + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + id}`, post)
    }

/*     public DeleteStore(id): Observable<any> {
        return this.http.delete(`${environment.apiURL_Main + '/api/Store/DeleteStore/' + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id}`);
    } */

     //delete
     public DeleteStore(id): Observable<any> {
        const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
        var urlDelete = `${environment.apiURL_Main + '/api/Store/DeleteStore/' + this.jwtAuth.getLang() +'/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()+ '/' + id}`;
        return this.http.post<any>(urlDelete,'',httpOptions)
          .pipe(
            catchError(this.handleError)
          );
      }
  
      public GetIfStoreKeeperUsed(Id): Observable<any> {
        return this.http.get(`${environment.apiURL_Main + '/api/Store/GetIfStoreKeeperUsed/' +  this.jwtAuth.getCompanyId() + '/' + Id}`)
    }



    public GetAllStoreManagerHistoryList(id): Observable<any> {
        return this.http.get(`${environment.apiURL_Main + '/api/Store/GetAllStoreKeeperHistory/' + this.jwtAuth.getLang() + '/' + this.jwtAuth.getUserId() + '/' + id }`)
    }

//.................. End 
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
