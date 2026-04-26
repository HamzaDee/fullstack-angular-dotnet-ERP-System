import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
@Injectable({
  providedIn: 'root'
})
export class DealersService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }

  public GetDealersList(type: number): Observable<any> {
    if (type == 1) {
      return this.http.get(`${environment.apiURL_Main + '/api/Dealers/GetCustomersList/' +
        this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + type}`)
        .pipe(
          catchError(this.handleError)
        )
    }
    else {
      return this.http.get(`${environment.apiURL_Main + '/api/Dealers/GetDealersList/' +
        this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + type}`)
        .pipe(
          catchError(this.handleError)
        )
    }

  }

  public GetDealersInitialForm(id, type, isHidden, opType): Observable<any> {
    debugger
    if (type == 1) {
      if (opType == "Show") {
        if (isHidden == true) {
          return this.http.get(`${environment.apiURL_Main + '/api/Dealers/ShowCustomerForm/' + this.jwtAuth.getLang() + '/'
            + id + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`)
            .pipe(
              catchError(this.handleError)
            )
        }
      }
      else
        {
          return this.http.get(`${environment.apiURL_Main + '/api/Dealers/GetCustomerFormById/' + this.jwtAuth.getLang() + '/'
          + id + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`)
          .pipe(
            catchError(this.handleError)
          )
        }              
    }
    else {
      if (opType == "Show") {
        return this.http.get(`${environment.apiURL_Main + '/api/Dealers/ShowDealerForm/' + this.jwtAuth.getLang() + '/'
          + id + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`)
          .pipe(
            catchError(this.handleError)
          )
      }
      else
        {
          return this.http.get(`${environment.apiURL_Main + '/api/Dealers/GetDealerFormById/' + this.jwtAuth.getLang() + '/'
          + id + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`)
          .pipe(
            catchError(this.handleError)
          )
        }      
    }
  }



  public getLeadsInfo(id ): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/LeadsCustomers/GetLeadsInfo/' + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() 
      + '/' + this.jwtAuth.getUserId() + '/'+ id 
    }`)
      .pipe(
        catchError(this.handleError)
      )
  }


  public SaveDealers(type, post): Observable<any> {
    debugger
    return this.http.post<any>(`${environment.apiURL_Main + '/api/Dealers/SaveDealers/' +
      this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + type}`, post)
      .pipe(
        catchError(this.handleError)
      )
  }
  //delete
  public DeleteSupplier(id): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    var urlDelete = `${environment.apiURL_Main + '/api/Dealers/DeleteSupplier/' + id + '/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`;
    return this.http.post<any>(urlDelete, '', httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  public DeleteCustomer(id): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    var urlDelete = `${environment.apiURL_Main + '/api/Dealers/DeleteCustomer/' + id + '/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`;
    return this.http.post<any>(urlDelete, '', httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }



  public GetCityList(id): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/Dealers/GetCitiesList/' + this.jwtAuth.getLang() + '/'
      + this.jwtAuth.getCompanyId() + '/' + id}`)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetAreasList(id): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/Dealers/GetAreasList/' + this.jwtAuth.getLang() + '/'
      + this.jwtAuth.getCompanyId() + '/' + id}`)
      .pipe(
        catchError(this.handleError)
      )
  }

  public UpdateFavourite(screenId): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post(`${environment.apiURL_Main + '/api/General/UpdateFavourite/'
      + screenId} `, null, httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetFavouriteStatus(screenId) {
    return this.http.get(`${environment.apiURL_Main + '/api/General/GetFavouriteStatus/' + screenId} `)
      .pipe(
        catchError(this.handleError)
      )
  }


  public GetMaxDealerNo(DealerTypeId): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/Dealers/GetMaxDealerNo/'
      + this.jwtAuth.getCompanyId() + '/' + DealerTypeId}`)
      .pipe(
        catchError(this.handleError)
      )
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
