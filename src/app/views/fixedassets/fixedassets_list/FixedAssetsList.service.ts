import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { JwtAuthService } from "app/shared/services/auth/jwt-auth.service";
import { environment } from "environments/environment";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";


@Injectable({
    providedIn: 'root'
})
export class FixedassetsListService {

    constructor(
        private http: HttpClient,
        private jwtAuth: JwtAuthService,
        private translateServie: TranslateService) { }
        
    //.................. Fixed Asssets List 

    public getFixedAssetsList(): Observable<any> {
        
        return this.http.get(`${environment.apiURL_Main + '/api/FixedAssetsList/GetFixedAssetsList/' +
          this.jwtAuth.getLang() + '/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`)
          .pipe(
            catchError(this.handleError)
          )
      }
    
      public getFixedAssetsListInfo(id, opType): Observable<any> {
        if(opType == "Show")
        {
        return this.http.get(`${environment.apiURL_Main + '/api/FixedAssetsList/ShowFixedAssetsListInfo/' + this.jwtAuth.getLang() + '/' + id +
          '/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()} `)
          .pipe(
            catchError(this.handleError)
          )
        }
        else
        {
        return this.http.get(`${environment.apiURL_Main + '/api/FixedAssetsList/GetFixedAssetsListInfo/' + this.jwtAuth.getLang() + '/' + id +
          '/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()} `)
          .pipe(
            catchError(this.handleError)
          )
        }
      }

      public getOriginalTypeInfo(TypeId): Observable<any> {
        return this.http.get(`${environment.apiURL_Main + '/api/FixedAssetsList/GetOriginalTypeInfo/' + TypeId}`)
          .pipe(
            catchError(this.handleError)
          )
      }

      public SaveFixedAssetsList(post): Observable<any> {
        
        return this.http.post<any>(`${environment.apiURL_Main + '/api/FixedAssetsList/PostFixedAssetsList/' +
          this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`, post)
          .pipe(
            catchError(this.handleError)
          )
      }


/*   public deleteFixedAssetsList(id): Observable<any> {
    var urlDelete = `${environment.apiURL_Main + '/api/FixedAssetsList/DeleteFixedAssetsList/' + id +'/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`;
    return this.http.delete(urlDelete)
      .pipe(
        catchError(this.handleError)
      );
  } */

      //delete
public deleteFixedAssetsList(id): Observable<any> {
  const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  var urlDelete = `${environment.apiURL_Main + '/api/FixedAssetsList/DeleteFixedAssetsList/' + id +'/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`;
  return this.http.post<any>(urlDelete,'',httpOptions)
    .pipe(
      catchError(this.handleError)
    );
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

    //.................. End Fixed Asssets List 

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