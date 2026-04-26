import { Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpErrorResponse, HttpHeaders, HttpParams } from "@angular/common/http";
import { environment } from "environments/environment";
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { TranslateService } from '@ngx-translate/core';
@Injectable({
  providedIn: 'root'
})
export class CostCenterService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
    private translateServie: TranslateService
  ) { }
  public CostCenterList(): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/CostCenter/CostCenterList/' +
      this.jwtAuth.getLang() + '/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`)
      .pipe(
        catchError(this.handleError)
      )
  }
  public GetCostCenterListByTableNo(tableNo): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/CostCenter/GetCostCenterListByTableNo/' +
      this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + tableNo}`)
      .pipe(
        catchError(this.handleError)
      )
  }
  public PostCostCenter(post): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/CostCenter/PostCostCenter/' +
      this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`, JSON.stringify(post), httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }
  public GetCostCenterInitailForm(id): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/CostCenter/GetCostCenterInitailForm/' + this.jwtAuth.getLang() + '/' + id +
      '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }
/*   public DeleteCostCenter(id): Observable<any> {
    var urlDelete = `${environment.apiURL_Main + '/api/CostCenter/DeleteCostCenter/' + id +
      '/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`;
    return this.http.delete(urlDelete)
      .pipe(
        catchError(this.handleError)
      );
  } */

  //delete
public DeleteCostCenter(id): Observable<any> {
  const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  var urlDelete = `${environment.apiURL_Main + '/api/CostCenter/DeleteCostCenter/' + id +'/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`;
  return this.http.post<any>(urlDelete,'',httpOptions)
    .pipe(
      catchError(this.handleError)
    );
}
  public GetMianTableDropDownList(): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/CostCenter/GetMianTableDropDownList/' +
      this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId()}`)
      .pipe(
        catchError(this.handleError)
      )
  }


  //------------------------------------------------------------------------------------------------------------------------------------------
  public GetMainBranchCostCenterForm(id): Observable<any> {
    debugger
    if(id > 0){
      return this.http.get(`${environment.apiURL_Main + '/api/CostCenter/AddMainCostCenterBranch/' + this.jwtAuth.getLang()
        + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()  + '/' + id} `)
      .pipe(
        catchError(this.handleError)
      )
    }  
  }

    public GetCostCenterNo(id): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/CostCenter/GetCostCenterNumber/' +
    this.jwtAuth.getCompanyId() + '/' + id}`)
      .pipe(
        catchError(this.handleError)
      )
  }

  
  public PostCostCenterBranch(post): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/CostCenter/MainCostCenterBranchForm/' + this.jwtAuth.getLang()
    + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() }`, JSON.stringify(post), httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  //------------------------------------------------------------------------------------------------------------------------------------------
  public GetCostCenterList(parentAccId , accLevel) : Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/CostCenter/GetCostCenterTreeList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + parentAccId + '/' + accLevel} `)
      .pipe(
        catchError(this.handleError)
      )
  }




    public CheckIfChooseSameAccNo(itemNo): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/CostCenter/CheckIfChooseSameAccNo/' +
    this.jwtAuth.getCompanyId() + '/' + itemNo}`)
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
