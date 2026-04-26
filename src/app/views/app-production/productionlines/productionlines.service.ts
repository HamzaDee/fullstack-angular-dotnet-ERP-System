import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProductionlinesService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
    private translateServie: TranslateService
  ) { }

  GetProdLine(id) : Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/ProductionLines/GetProdLine/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public SaveProdLine(post): Observable<any> {
    return this.http.post<any>(`${environment.apiURL_Main + '/api/ProductionLines/SaveProdLine/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`, post)
  }

  GetItemUnits(itemNo) : Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/ProductionLines/GetItemUnits/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + itemNo} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  CheckLineNo(lineNo) : Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/ProductionLines/CheckProdLineNo/'
      + this.jwtAuth.getCompanyId() + '/' + lineNo} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  GetProdLinesListSer() : Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/ProductionLines/GetProdLinesList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

   public GetItemUnitbyItemId(id): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/General/GetUnitByItemId/'
      + this.jwtAuth.getLang()  + '/' + this.jwtAuth.getCompanyId() + '/' + id} `)
      .pipe(
        catchError(this.handleError)
      )
  }
  
/*   DeleteProdLine(id) : Observable<any> {
    debugger
    return this.http.delete(`${environment.apiURL_Main + '/api/ProductionLines/DeleteProdLine/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id} `)
      .pipe(
        catchError(this.handleError)
      )
  } */

             //delete
    public DeleteProdLine(id): Observable<any> {
      const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      var urlDelete = `${environment.apiURL_Main + '/api/ProductionLines/DeleteProdLine/' + this.jwtAuth.getLang() +'/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()+ '/' + id }`;
      return this.http.post<any>(urlDelete,'',httpOptions)
        .pipe(
          catchError(this.handleError)
        );
    }

  handleError(handleError: any): any {
    throw new Error('Method not implemented.');
  }
}
