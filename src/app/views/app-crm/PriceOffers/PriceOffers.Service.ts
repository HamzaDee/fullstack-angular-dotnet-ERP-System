import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';

@Injectable({
  providedIn: 'root'
})
export class PriceOffersService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }

  public GetQuotationsList(): Observable<any> {
    return this.http.get(
      `${environment.apiURL_Main}/api/Quotations/GetQuotationsList/`
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()
    ).pipe(
      catchError(this.handleError)
    );
  }

  public IsValidVoucherNo(voucherNo, voucherTypeId): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/Quotations/IsValidVoucherNo/' + this.jwtAuth.getCompanyId() + '/' + voucherNo+ '/' + voucherTypeId}`)
      .pipe(
        catchError(this.handleError)
      )
  }


  public SearchQuotationsList(searchModel: any): Observable<any> {
    return this.http.post(
      `${environment.apiURL_Main}/api/Quotations/SearchQuotationsList/`
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId(),
      searchModel
    ).pipe(
      catchError(this.handleError)
    );
  }

  public GetQuotationForm(id: any, opType: string): Observable<any> {
    return this.http.get(
      `${environment.apiURL_Main}/api/Quotations/GetQuotationForm/`
      + this.jwtAuth.getLang() + '/'
      + this.jwtAuth.getCompanyId() + '/'
      + this.jwtAuth.getUserId() + '/'
      + id + '/'
      + opType
    ).pipe(
      catchError(this.handleError)
    );
  }

  public SaveQuotationForm(model: any): Observable<any> {
    debugger
    return this.http.post(
      `${environment.apiURL_Main}/api/Quotations/SaveQuotationForm/`
      + this.jwtAuth.getCompanyId() + '/'
      + this.jwtAuth.getUserId(),
      model
    ).pipe(
      catchError(this.handleError)
    );
  }

  public DeleteQuotation(id: number): Observable<any> {
    return this.http.post(
      `${environment.apiURL_Main}/api/Quotations/DeleteQuotation/`
      + this.jwtAuth.getCompanyId() + '/'
      + this.jwtAuth.getUserId() + '/'
      + id,
      {}
    ).pipe(
      catchError(this.handleError)
    );
  }

  public UpdateFavourite(screenId): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post(
      `${environment.apiURL_Main}/api/General/UpdateFavourite/`
      + screenId + '/' + this.jwtAuth.getUserId(),
      null,
      httpOptions
    ).pipe(
      catchError(this.handleError)
    );
  }

  public GetFavouriteStatus(screenId): Observable<any> {
    return this.http.get(
      `${environment.apiURL_Main}/api/General/GetFavouriteStatus/`
      + screenId + '/' + this.jwtAuth.getUserId()
    ).pipe(
      catchError(this.handleError)
    );
  }

  public GetSerialVoucher(serialType: any, voucherTypeId: any, voucherCategory: any, year: any, month: any): Observable<any> {
    return this.http.get(
      `${environment.apiURL_Main}/api/Common/GetSerialVoucher/`
      + serialType + '/'
      + voucherTypeId + '/'
      + voucherCategory + '/'
      + year + '/'
      + month
    ).pipe(
      catchError(this.handleError)
    );
  }

  public IfExistVoucher(voucherTypeId: any, voucherNo: any): Observable<any> {
    return this.http.get(
      `${environment.apiURL_Main}/api/Common/CheckVoucherNo/`
      + this.jwtAuth.getCompanyId() + '/'
      + this.jwtAuth.getUserId() + '/'
      + voucherTypeId + '/'
      + voucherNo
    ).pipe(
      catchError(this.handleError)
    );
  }

  public GetItemUintbyItemId(itemId: any): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/General/GetUnitByItemId/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + itemId} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetPriceUnit(itemId: any, unitId: any): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/SalesRequst/GetPriceUnit/' + itemId + '/' + unitId}`)
      .pipe(
        catchError(this.handleError)
      )
  }

 public getTaxPersantage(id): Observable<any> {
  return this.http.get(`${environment.apiURL_Main + '/api/AssetSalesInvoice/GetTaxPersantage/'+  id}`)
    .pipe(
      catchError(this.handleError)
    )
}



 public GetOppertunitiesItems(id): Observable<any> {
  return this.http.get(`${environment.apiURL_Main + '/api/Quotations/GetOppertunitiesItems/'+ this.jwtAuth.getCompanyId() + '/' + id}`)
    .pipe(
      catchError(this.handleError)
    )
}


  private handleError = (error: HttpErrorResponse) => {
    debugger;

    if (error.error instanceof ErrorEvent) {
      console.log(error.error.message);
    } else {
      console.log(error.status);
    }

    console.log('Something is wrong!');
    return throwError(() => error);
  };
}