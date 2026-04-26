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
export class DealeritemsService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
    private translateServie: TranslateService
  ) { }

  GetDealerItems(id) : Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/DealersItems/GetDealerItems/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public SaveDealerItems(post): Observable<any> {
    return this.http.post<any>(`${environment.apiURL_Main + '/api/DealersItems/SaveDealerItems/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`, post)
  }

  GetItemUnits(itemNo) : Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/ProductionLines/GetItemUnits/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + itemNo} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  GetDealersList() : Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/DealersItems/GetDealersList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }
  
  DeleteProdLine(id) : Observable<any> {
    debugger
    return this.http.delete(`${environment.apiURL_Main + '/api/ProductionLines/DeleteProdLine/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  handleError(handleError: any): any {
    throw new Error('Method not implemented.');
  }
}
