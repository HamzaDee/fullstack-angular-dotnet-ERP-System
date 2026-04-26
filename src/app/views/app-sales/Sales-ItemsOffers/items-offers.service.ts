import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { environment } from 'environments/environment';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ItemsOffersService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
    private translateServie: TranslateService) { }


  //Search
  public getItemsOffersList(): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/ItemsOffers/GetItemsOffersList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }



  //get
  public GetItemsOffers(id, opType): Observable<any> {
    debugger
    if (id > 0) {
      if (opType == 'Copy') {
        return this.http.get(`${environment.apiURL_Main + '/api/ItemsOffers/CopyItemsOffers/' + this.jwtAuth.getLang()
          + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id} `)
          .pipe(
            catchError(this.handleError)
          )
      }
      else if (opType == 'Show') {
        return this.http.get(`${environment.apiURL_Main + '/api/ItemsOffers/ShowItemsOffers/' + this.jwtAuth.getLang()
          + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id} `)
          .pipe(
            catchError(this.handleError)
          )
      }
      else {
        return this.http.get(`${environment.apiURL_Main + '/api/ItemsOffers/EditItemsOffers/' + this.jwtAuth.getLang()
          + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id} `)
          .pipe(
            catchError(this.handleError)
          )
      }
    }
    else {
      return this.http.get(`${environment.apiURL_Main + '/api/ItemsOffers/AddItemsOffers/' + this.jwtAuth.getLang()
        + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id}`)
        .pipe(
          catchError(this.handleError)
        )
    }
  }


  // get Item 
  public GetItemUintbyItemId(id): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/General/GetUnitByItemId/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + id} `)
      .pipe(
        catchError(this.handleError)
      )
  }


  // save 
  public saveItemsOffers(post): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/ItemsOffers/PostItemsOffers/'
      + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `, JSON.stringify(post), httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

      //delete
    public DeleteItemsOffers(id): Observable<any> {
      const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      var urlDelete = `${environment.apiURL_Main + '/api/ItemsOffers/DeleteItemsOffers/' + id +'/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`;
      return this.http.post<any>(urlDelete,'',httpOptions)
        .pipe(
          catchError(this.handleError)
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
  }
}
