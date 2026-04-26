import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';

@Injectable({
  providedIn: 'root'
})
export class LeadsActivitiesService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }

 
public GetLeadsActivitiesList(): Observable<any> {
    debugger
  return this.http.get(
    `${environment.apiURL_Main}/api/LeadsActivities/GetLeadsActivitiesList/`
    + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()
  ).pipe(
    catchError(this.handleError) 
  );
}


  
  public GetLeadsActivitiesForm(id): Observable<any> {
    return this.http.get(
      `${environment.apiURL_Main + '/api/LeadsActivities/GetLeadsActivitiesForm/'}`
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id
    ).pipe(
      catchError(this.handleError)
    );
  }


  
    public getLeadsInfo(id ): Observable<any> {
      return this.http.get(`${environment.apiURL_Main + '/api/LeadsCustomers/GetLeadsInfo/' + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() 
        + '/' + this.jwtAuth.getUserId() + '/'+ id 
      }`)
        .pipe(
          catchError(this.handleError)
        )
    }
  
  public PostLeadsActivities(model: any): Observable<any> {
    return this.http.post(
      `${environment.apiURL_Main + '/api/LeadsActivities/PostLeadsActivities/'}`
      + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getLang(),
      model
    ).pipe(
      catchError(this.handleError)
    );
  }

  
  public SearchLeadsActivitiesList(searchModel: any): Observable<any> {
    return this.http.post(
      `${environment.apiURL_Main + '/api/LeadsActivities/SearchLeadsActivitiesList/'}`
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId(),
      searchModel
    ).pipe(
      catchError(this.handleError)
    );
  }


  public CancelLeadsActivities(activityId: number): Observable<any> {
    return this.http.post(
      `${environment.apiURL_Main + '/api/LeadsActivities/CancelLeadsActivities/'}`
      + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' +  activityId ,
      {}
    ).pipe(
      catchError(this.handleError)
    );
  }

  
  public CloseLeadsActivities(activityId: number): Observable<any> {
    return this.http.post(
      `${environment.apiURL_Main + '/api/LeadsActivities/CloseLeadsActivities/'}`
      + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + activityId ,
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
 private handleError = (error: HttpErrorResponse) => {
    debugger;

    if (error.error instanceof ErrorEvent) {
        console.log(error.error.message);
    } else {
        console.log(error.status);
    }

    console.log('Something is wrong!');
    return throwError(() => error);
};
}
