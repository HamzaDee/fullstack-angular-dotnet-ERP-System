import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { environment } from 'environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ComparisonSalesOfCategoryService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
    private translateServie: TranslateService) { }



  //.....................ComparisonSalesOfCategoryOrItemByYears

public GetSalesOfCategorReportForm(): Observable<any> {
  debugger
  return this.http.get(`${environment.apiURL_Main + '/api/ComparisonSalesOfCategoryOrItemByYears/GetComparisonSalesOfCategoryOrItemByYearsReport/' + this.jwtAuth.getLang()
    + '/' + this.jwtAuth.getCompanyId()  + '/' +this.jwtAuth.getUserId() } `)
    .pipe(
      catchError(this.handleError)
    )
}



public GetFiltercomparisonSalesOfCategory( 
  itemId:number,
  categoryId:number,
): Observable<any> {
  debugger
  const lang = this.jwtAuth.getLang();
  const companyId = this.jwtAuth.getCompanyId();
  const userId = this.jwtAuth.getUserId();
  
  const params = new HttpParams()
    .set('itemId', itemId)
    .set('categoryId', categoryId)
  return this.http.get(`${environment.apiURL_Main}/api/ComparisonSalesOfCategoryOrItemByYears/FilterComparisonSalesOfCategoryOrItemByYears/${lang}/${companyId}/${userId}`, { params })
    .pipe(
      catchError(this.handleError)
    );
} 

//..............................ComparisonSalesOfCategoryOrItemByYears


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
