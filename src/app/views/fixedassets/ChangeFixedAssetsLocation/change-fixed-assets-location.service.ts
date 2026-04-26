import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { environment } from 'environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ChangeFixedAssetsLocationService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
    private translateServie: TranslateService) { }


  //.................. Change Fixed Assets Location

  public getChangeFixedAssetsLocationList(): Observable<any> {

    return this.http.get(`${environment.apiURL_Main + '/api/ChangeFixedAssetsLocation/GetChangeFixedAssetsLocationList/' +
      this.jwtAuth.getLang() + '/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`)
      .pipe(
        catchError(this.handleError)
      )
  }

  public getFixedAssetLocationChangeInfo(id,opType): Observable<any> 
  {
    if(opType == "Show")
    {
   return this.http.get(`${environment.apiURL_Main + '/api/ChangeFixedAssetsLocation/ShowFixedAssetLocation/' + this.jwtAuth.getLang() + '/' + id +
      '/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()} `)
      .pipe(
        catchError(this.handleError)
      )
    }
    else
    {
   return this.http.get(`${environment.apiURL_Main + '/api/ChangeFixedAssetsLocation/GetFixedAssetLocationChangeInfo/' + this.jwtAuth.getLang() + '/' + id +
      '/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()} `)
      .pipe(
        catchError(this.handleError)
      )
    }

  }

  public getCurrentlocation(id): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/ChangeFixedAssetsLocation/GetCurrentlocation/' + this.jwtAuth.getLang() + '/' + id}`)
      .pipe(
        catchError(this.handleError)
      )
  }


  public saveFixedAssetLocationChange(post): Observable<any> {

    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/ChangeFixedAssetsLocation/PostFixedAssetLocationChange/'
      + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `, JSON.stringify(post), httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  /*     public deleteFixedAssetsLocationChange(id): Observable<any> {
        var urlDelete = `${environment.apiURL_Main + '/api/ChangeFixedAssetsLocation/DeleteFixedAssetsLocationChange/' + id +'/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`;
        return this.http.delete(urlDelete)
          .pipe(
            catchError(this.handleError)
          );
      } */

  //delete
  public deleteFixedAssetsLocationChange(id): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    var urlDelete = `${environment.apiURL_Main + '/api/ChangeFixedAssetsLocation/DeleteFixedAssetsLocationChange/' + id + '/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`;
    return this.http.post<any>(urlDelete, '', httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }


  public getCopyFixedAssetLocationChangeInfo(id): Observable<any> {

    return this.http.get(`${environment.apiURL_Main + '/api/ChangeFixedAssetsLocation/GetCopyFixedAssetLocationChangeInfo/' + this.jwtAuth.getLang() + '/' + id +
      '/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public getFixedAssetLocationChangePrint(id): Observable<any> {

    return this.http.get(`${environment.apiURL_Main + '/api/ChangeFixedAssetsLocation/GetFixedAssetLocationChangePrint/' + this.jwtAuth.getLang() + '/' + id +
      '/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()} `)
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



  public IfExistVoucher(voucherDate, transNo): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/ChangeFixedAssetsLocation/CheckVoucherNo/' + this.jwtAuth.getCompanyId() 
      + '/' + this.jwtAuth.getUserId() + '/' +  voucherDate + '/' + transNo}`)
      .pipe(
        catchError(this.handleError)
      )
  }
  //.................. End Change Fixed Assets Location

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
