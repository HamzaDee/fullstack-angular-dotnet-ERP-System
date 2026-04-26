import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
@Injectable({
  providedIn: 'root'
})
export class CloseYearService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }


  public GetCloseYearIntitialForm(): Observable<any> {
      return this.http.get(`${environment.apiURL_Main + '/api/CloseFiscalYear/GetCloseYeaerForm/' + this.jwtAuth.getLang() 
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
        .pipe(
          catchError(this.handleError)
        )
    }  
  


    public CloseYear( 
      id:number,
      profLossAccId: number,
      firstInvAcc : any[],
      lastInvAc : any[],
      isDetails: number,

      
      
    ): Observable<any> {
      debugger
      const lang = this.jwtAuth.getLang();
      const companyId = this.jwtAuth.getCompanyId();
      const userId = this.jwtAuth.getUserId();
      
      const params = new HttpParams()
        .set('Year', id)
        .set('ProfLossAccId', profLossAccId)
        .set('FirstInvAcc', JSON.stringify(firstInvAcc)) 
        .set('LastInvAcc', JSON.stringify(lastInvAc))
        .set('isDetails', isDetails.toString());
      return this.http.get(`${environment.apiURL_Main}/api/CloseFiscalYear/CloseYear/${companyId}/${userId}`, { params })
        .pipe(
          catchError(this.handleError)
        );
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