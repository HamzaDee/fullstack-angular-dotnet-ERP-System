import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BankssService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
    private translateServie: TranslateService
  ) { }
  public GetBanksList(): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/BanksCash/GetBanksList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetBanksForm(id): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/BanksCash/GetBanksForm/' + this.jwtAuth.getLang()
      + '/' + id + '/' + this.jwtAuth.getCompanyId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }


/*   public DeleteBank(id): Observable<any> {
    var urlDelete = `${environment.apiURL_Main + '/api/BanksCash/DeleteBank/' + id + '/'
      + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`;
    return this.http.delete(urlDelete)
      .pipe(
        catchError(this.handleError)
      );
  } */


    //delete
public DeleteBank(id): Observable<any> {
  const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  var urlDelete = `${environment.apiURL_Main + '/api/BanksCash/DeleteBank/' + id +'/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`;
  return this.http.post<any>(urlDelete,'',httpOptions)
    .pipe(
      catchError(this.handleError)
    );
}

  public GetBanksFormById(id,ishidden): Observable<any> {
    debugger
    if(ishidden == true)
    {
    return this.http.get(`${environment.apiURL_Main + '/api/BanksCash/ShowBank/' + this.jwtAuth.getLang()
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id } `)
      .pipe(
        catchError(this.handleError)
      )
    }
    else
    {
    return this.http.get(`${environment.apiURL_Main + '/api/BanksCash/GetBankById/' + this.jwtAuth.getLang()
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id } `)
      .pipe(
        catchError(this.handleError)
      )
    }
  }

  public PostBanks(post): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/BanksCash/PostBank/'
      + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`, JSON.stringify(post), httpOptions)
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


