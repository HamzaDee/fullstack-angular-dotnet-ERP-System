import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ItemsdealersService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
    private translateServie: TranslateService
  ) { }

  GetItemsList() : Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/ItemsDealers/GetItemsList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() } `)
      .pipe(
        catchError(this.handleError)
      )
  }

  GetDealersList(itemNo) : Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/ItemsDealers/GetDealersList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + itemNo} `)
      .pipe(
        catchError(this.handleError)
      )
  }
  
  handleError(handleError: any): any {
    throw new Error('Method not implemented.');
  }
}
