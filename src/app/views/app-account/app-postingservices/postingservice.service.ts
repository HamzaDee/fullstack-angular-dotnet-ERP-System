import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders , HttpParams } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';


@Injectable({
  providedIn: 'root'
})
export class postServingService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }
 
  public GetPostingServiceForm(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/Posting/AddPosting/' + this.jwtAuth.getLang()
      + '/' + this.jwtAuth.getCompanyId()  + '/' +this.jwtAuth.getUserId() } `)
      .pipe(
        catchError(this.handleError)
      )
  }
  public GetVouchers( 
    id:number,
    isPosted: number,
    voucherTypeId: number,
    voucherNoFrom: string,
    voucherNoTo: string,
    fromDate: string,
    toDate: string,
    branchId: number,
    note: string,

  ): Observable<any> {
    debugger
    const lang = this.jwtAuth.getLang();
    const companyId = this.jwtAuth.getCompanyId();
    const userId = this.jwtAuth.getUserId();
    
    const params = new HttpParams()
      .set('id', id)
      .set('PostType', isPosted)
      .set('VoucherType', voucherTypeId)
      .set('VoucherNoFrom', voucherNoFrom)
      .set('VoucherNoTo', voucherNoTo)
      .set('FromDate', fromDate)
      .set('ToDate', toDate)
      .set('BranchId', branchId)
      .set('Note', note)
      
  
    return this.http.get(`${environment.apiURL_Main}/api/Posting/GetVouchers/ ${lang}/${companyId}/${userId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }  
  public SavePostingVoucher(post): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    debugger
    return this.http.post<any>(`${environment.apiURL_Main +'/api/Posting/EditIsPosted/'
      + this.jwtAuth.getCompanyId()   + '/' + this.jwtAuth.getUserId() }`, JSON.stringify(post), httpOptions)
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
