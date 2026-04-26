import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { environment } from 'environments/environment';
import { catchError, Observable, pipe, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShippingService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
    private translateServie: TranslateService) { }

    public GetShippingList(): Observable<any> {
      debugger
      return this.http.get(`${environment.apiURL_Main + '/api/Shipping/GetShippingList/'
        + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
        .pipe(
          catchError(this.handleError)
        )
    }

    public GetShippingForm(id, opType): Observable<any> {
      debugger
      if(id > 0)
      {
        if(opType == 'Show')
          {
            return this.http.get(`${environment.apiURL_Main + '/api/Shipping/ShowShippingForm/'
            + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id } `)
            .pipe(
            catchError(this.handleError)
            )      
          }
          else
          {
            return this.http.get(`${environment.apiURL_Main + '/api/Shipping/EditShippingForm/'
            + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id } `)
            .pipe(
            catchError(this.handleError)
            )      
          }          
      } 
      else{
        return this.http.get(`${environment.apiURL_Main + '/api/Shipping/AddShippingForm/'
        + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id } `)
        .pipe(
          catchError(this.handleError)
        )
      }   
    }

    public GetSalesOrder(transNo): Observable<any>
    {
      debugger
      return this.http.get(`${environment.apiURL_Main + '/api/Shipping/GetSalesOrder/'  + transNo} `)
      .pipe(
        catchError(this.handleError)
      )
    }

    public SaveShipping(post): Observable<any> {
      debugger
      const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      return this.http.post<any>(`${environment.apiURL_Main + '/api/Shipping/SaveShipping/' + this.jwtAuth.getUserId() + 
      '/' + this.jwtAuth.getCompanyId()}`, JSON.stringify(post), httpOptions)
        .pipe(
          catchError(this.handleError)
        )
    }

    public DeleteShipping(Id): Observable<any> {
      const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      var urlDelete = `${environment.apiURL_Main + '/api/Shipping/DeleteShipping/' + Id +'/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`;
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
    return this.http.get(`${environment.apiURL_Main + '/api/General/GetFavouriteStatus/' + screenId  } `)
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
