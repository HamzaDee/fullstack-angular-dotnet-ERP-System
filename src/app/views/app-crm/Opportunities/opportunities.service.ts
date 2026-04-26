import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { environment } from 'environments/environment';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OpportunitiesService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
    private translateServie: TranslateService) { }

  //List
  public getOpportunitiesList(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/Opportunities/GetOpportunitiesList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

        public IsValidOpportunityNo(OpportunityNo): Observable<any> {
        debugger
        return this.http.get(`${environment.apiURL_Main + '/api/Opportunities/IsValidOpportunityNo/'+ this.jwtAuth.getCompanyId() + '/' + OpportunityNo}`)
          .pipe(
            catchError(this.handleError)
          )    
      }


  //get
  public GetInitailOpportunities(Id, opType): Observable<any> {
    debugger
    if (Id > 0) {
      if (opType == 'Show') {
        return this.http.get(`${environment.apiURL_Main + '/api/Opportunities/ShowOpportunities/' + this.jwtAuth.getLang()
          + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + Id} `)
          .pipe(
            catchError(this.handleError)
          )
      }
      else {
        return this.http.get(`${environment.apiURL_Main + '/api/Opportunities/EditOpportunities/' + this.jwtAuth.getLang()
          + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + Id} `)
          .pipe(
            catchError(this.handleError)
          )
      }
    }
    else {
      return this.http.get(`${environment.apiURL_Main + '/api/Opportunities/AddOpportunitiesInfo/' + this.jwtAuth.getLang()
        + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + Id} `)
        .pipe(
          catchError(this.handleError)
        )
    }
  }

  public GetItemUnitbyItemId(id): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/General/GetUnitByItemId/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + id} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  //Tax Perc
  public getTaxPersantage(id): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/AssetSalesInvoice/GetTaxPersantage/' + id}`)
      .pipe(
        catchError(this.handleError)
      )
  }

  // save 
  public saveOpportunities(post): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/Opportunities/PostOpportunities/'
      + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `, JSON.stringify(post), httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  //Delete
  public CancelOpportunities(Id: number): Observable<any> {
    return this.http.post(
      `${environment.apiURL_Main + '/api/Opportunities/CancelOpportunities/'}`
      + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + Id,
      {}
    ).pipe(
      catchError(this.handleError)
    );
  }

  public UpdateFavourite(screenId): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post(`${environment.apiURL_Main + '/api/General/UpdateFavourite/'
      + screenId + '/' + this.jwtAuth.getUserId()} `, null, httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetFavouriteStatus(screenId): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/General/GetFavouriteStatus/' + screenId + '/' + this.jwtAuth.getUserId()} `)
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
