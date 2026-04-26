import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import el from 'date-fns/esm/locale/el/index.js';

@Injectable({
  providedIn: 'root'
})
export class MaterialforecastService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }

  public GetMaterialForecast(itemId,materialId): Observable<any>
  {
    return this.http.get(`${environment.apiURL_Main + '/api/ProductionReports/GetMaterialForecast/'
        + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + itemId + '/' + materialId} `)
        .pipe(
        catchError(this.handleError)
        )      
  }


    public GetMaterialItem(itemId): Observable<any>
  {
    return this.http.get(`${environment.apiURL_Main + '/api/ProductionReports/GetMaterialItem/' + this.jwtAuth.getLang() + '/' + itemId } `)
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
    if (error.error instanceof ErrorEvent) {
      console.log(error.error.message)
    } else {
      console.log(error.status)
    }
    return throwError(
      console.log('Something is wrong!'));
  }
}
