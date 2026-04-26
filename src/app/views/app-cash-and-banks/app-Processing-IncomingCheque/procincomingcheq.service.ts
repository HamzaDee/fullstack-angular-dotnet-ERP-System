import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProcincheqService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }

  public GetProcessingIncomingChequeList(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/ProcessingIncomingCheque/ProcessingIncomingChequeList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  formatCurrency(value: number, decimalPlaces: number): string {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    });
  }

  public SaveProcessingIncomingCheque(post: any): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/ProcessingIncomingCheque/SaveProcessingIncomingCheque/'
      + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `, JSON.stringify(post), httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  /*   public PostProcessingIncomingCheque(voucherId): Observable<any> {
      debugger
      const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      return this.http.put(`${environment.apiURL_Main + '/api/ProcessingIncomingCheque/PostProcessingIncomingCheque/'
        + voucherId + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,null,httpOptions)
        .pipe(
          catchError(this.handleError)
        )
    } */

  public PostProcessingIncomingCheque(voucherId: number): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    var urlDelete = `${environment.apiURL_Main + '/api/ProcessingIncomingCheque/PostProcessingIncomingCheque/' + voucherId + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`;
    return this.http.post<any>(urlDelete, '', httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  /* public DeleteProcessingIncomingCheque(voucherId): Observable<any> {
    debugger    
    return this.http.delete(`${environment.apiURL_Main + '/api/ProcessingIncomingCheque/DeleteProcessingIncomingCheque/'
      + voucherId + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  } */

  //delete
  public DeleteProcessingIncomingCheque(voucherId: number): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    var urlDelete = `${environment.apiURL_Main + '/api/ProcessingIncomingCheque/DeleteProcessingIncomingCheque/' + voucherId + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`;
    return this.http.post<any>(urlDelete, '', httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  public GetSerialVoucher(serialType: string, voucherTypeId: number, VoucherCategory: any, year: number, month: number): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/EntryVouchers/GetSerialVoucher/'
      + this.jwtAuth.getCompanyId() + '/' + serialType + '/' + voucherTypeId + '/' + VoucherCategory + '/' + year + '/' + month} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetInitailProcessingIncomingCheque(voucherId: number, opType: string): Observable<any> {
    if (voucherId > 0) {
      if (opType == 'Copy') {
        return this.http.get(`${environment.apiURL_Main + '/api/ProcessingIncomingCheque/CopyProcessingIncomingCheque/' + this.jwtAuth.getLang()
          + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
          .pipe(
            catchError(this.handleError)
          )
      }
      else if (opType == 'Reverse') {
        return this.http.get(`${environment.apiURL_Main + '/api/ProcessingIncomingCheque/ReverseProcessingIncomingCheque/' + this.jwtAuth.getLang()
          + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
          .pipe(
            catchError(this.handleError)
          )
      }
      else if (opType == 'Show') {
        return this.http.get(`${environment.apiURL_Main + '/api/ProcessingIncomingCheque/ShowProcessingIncomingCheque/' + this.jwtAuth.getLang()
          + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
          .pipe(
            catchError(this.handleError)
          )
      }
      else {
        return this.http.get(`${environment.apiURL_Main + '/api/ProcessingIncomingCheque/EditProcessingIncomingCheque/' + this.jwtAuth.getLang()
          + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
          .pipe(
            catchError(this.handleError)
          )
      }
    }
    else {
      return this.http.get(`${environment.apiURL_Main + '/api/ProcessingIncomingCheque/AddProcessingIncomingCheque/' + this.jwtAuth.getLang()
        + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
        .pipe(
          catchError(this.handleError)
        )
    }
  }

  public GetValidVoucherNo(VoucherNo: string, VoucherTypeId: number): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/ProcessingIncomingCheque/IsValidVoucherNo/' + this.jwtAuth.getCompanyId() + '/' + VoucherNo + '/' + VoucherTypeId}`)
      .pipe(
        catchError(this.handleError)
      )
  }


  public GetIncomingChequesInfo(CheqId: number, VoucherTypeId: number): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/ProcessingIncomingCheque/GetIncomingChequesInfo/' + this.jwtAuth.getLang()
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + CheqId + '/' + VoucherTypeId} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public UpdateFavourite(screenId: number): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post(`${environment.apiURL_Main + '/api/General/UpdateFavourite/'
      + screenId} `, null, httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetFavouriteStatus(screenId: number): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/General/GetFavouriteStatus/' + screenId} `)
      .pipe(
        catchError(this.handleError)
      )
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
