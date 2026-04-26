import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';

@Injectable({
  providedIn: 'root'
})
export class LandedCostService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }

  public GetLandedCostList(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/LandedCost/GetLandedCostList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetLandedCostListBySearch(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/LandedCost/GetLandedCostListBySearch/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )    
  }

  public GetInitailandedCost(voucherId, opType): Observable<any> {
    if(voucherId > 0){
       if(opType == 'Show'){
       return this.http.get(`${environment.apiURL_Main + '/api/LandedCost/ShowLandedCost/' + this.jwtAuth.getLang() 
         + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
        .pipe(
          catchError(this.handleError)
        )
      }
      else{
        return this.http.get(`${environment.apiURL_Main + '/api/LandedCost/EditLandedCost/' + this.jwtAuth.getLang() 
        + '/' + voucherId + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
        .pipe(
          catchError(this.handleError)
        )
      }
    }
    else{
      return this.http.get(`${environment.apiURL_Main + '/api/LandedCost/AddLandedCost/' + this.jwtAuth.getLang() 
       + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherId} `)
        .pipe(
          catchError(this.handleError)
        )
    }   
  }



    public SaveLandedCost(post): Observable<any> {
        debugger
        const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
        return this.http.post<any>(`${environment.apiURL_Main + '/api/LandedCost/SaveLandedCost/'
        + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,JSON.stringify(post),httpOptions)
        .pipe(
            catchError(this.handleError)
        )
    }

  public PostEntryVoucher(voucherId): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    var urlDelete = `${environment.apiURL_Main + '/api/LandedCost/PostLandedCost/' + voucherId +'/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`;
    return this.http.post<any>(urlDelete,'',httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

    public IfExistVoucher(VoucherTypeId, VoucherNo): Observable<any> {
        return this.http.get(`${environment.apiURL_Main + '/api/PurchaseRequest/CheckVoucherNo/' + this.jwtAuth.getCompanyId() 
        + '/' + this.jwtAuth.getUserId() + '/' +  VoucherTypeId  + '/' + VoucherNo}`)
        .pipe(
            catchError(this.handleError)
        )
    }

    //delete
    public DeleteVoucher(voucherId): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    var urlDelete = `${environment.apiURL_Main + '/api/PurchaseRequest/DeletePueRequest/' + voucherId +'/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`;
    return this.http.post<any>(urlDelete,'',httpOptions)
        .pipe(
        catchError(this.handleError)
        );
    }

    public GetSerialVoucher(serialType, voucherTypeId, VoucherCategory, year, month): Observable<any> {
        debugger
        return this.http.get(`${environment.apiURL_Main + '/api/LandedCost/GetLandedCostVoucher/'
        + this.jwtAuth.getCompanyId() + '/' + serialType + '/' + voucherTypeId + '/' + VoucherCategory + '/' + year + '/' + month} `)
        .pipe(
            catchError(this.handleError)
        )
    }
  
    public getExpensesAccounts(id): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/PurchaseInvoice/GetExpensesAccount/' +  this.jwtAuth.getCompanyId() + '/' + id}`)
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

    public GetVouchersToReCost(receiptIds): Observable<any> {
      return this.http.get(`${environment.apiURL_Main + '/api/LandedCost/GetVouchersToReCost/' + this.jwtAuth.getLang() 
          + '/' + this.jwtAuth.getCompanyId() + '/' + receiptIds}`)
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
