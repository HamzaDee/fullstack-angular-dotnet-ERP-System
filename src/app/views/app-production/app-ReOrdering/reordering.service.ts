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
export class ReorderingService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }

  public GetReorderingItemsList(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/ReOrderingItems/GetReOrderingItems/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }
  
  public SaveReorderingItems(post): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/ReOrderingItems/SaveReOrederingItems/' + this.jwtAuth.getCompanyId() + 
    '/' +  this.jwtAuth.getUserId()}`, JSON.stringify(post), httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }



  public SaveReorderingItemsByRow(item: string, ol: number, OQ1: number, LoadTime: number, AvUsedDaily: number): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  
    return this.http.post<any>(
      `${environment.apiURL_Main}/api/ReOrderingItems/SaveReOrderingItemsRow/${item}/${ol}/${OQ1}/${LoadTime}/${AvUsedDaily}`, 
      null,
      httpOptions
    )
    .pipe(
      catchError(this.handleError)
    );
  }
  
  public GetReOrderingItemsByCategory(CategoryId): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/ReOrderingItems/GetReOrderingItemsByCategory/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + CategoryId} `)
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
