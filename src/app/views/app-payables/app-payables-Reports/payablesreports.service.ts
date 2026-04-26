import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders , HttpParams } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { formatDate } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class SupplierReportsService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }
 //#region Supplier Balance
  public GetSupplierBalanceForm(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/PayablesReport/GetSupplierBalanceForm/' + this.jwtAuth.getLang()
      + '/' + this.jwtAuth.getCompanyId()  + '/' +this.jwtAuth.getUserId() } `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public Getreportstanderd( 
    supplierId:number,
    toDate: string,
    branchId: number,
    status: number,
    dealerTypeId:number,
    currencyId:number,
    currRate:number,
  ): Observable<any> {
    debugger
    const lang = this.jwtAuth.getLang();
    const companyId = this.jwtAuth.getCompanyId();
    const userId = this.jwtAuth.getUserId();
    
    const params = new HttpParams()
      .set('DealerId', supplierId)
      .set('ToDate', toDate)
      .set('Status', status)
      .set('BranchId', branchId)
      .set('DealerTypeId', dealerTypeId)
      .set('CurrencyId', currencyId)
      .set('CurrRate', currRate)
    return this.http.get(`${environment.apiURL_Main}/api/PayablesReport/GetSupplierBalance/${lang}/${companyId}/${userId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }  

  public GetreportByYear( 
    supplierId:number,
    status: number,
    branchId: number,
    yearId: number,
    dealerTypeId:number,
    currencyId:number,
    currRate:number,
  ): Observable<any> {
    debugger
    const lang = this.jwtAuth.getLang();
    const companyId = this.jwtAuth.getCompanyId();
    const userId = this.jwtAuth.getUserId();
    
    const params = new HttpParams()
      .set('SupplierId', supplierId)
      .set('Status', status)
      .set('BranchId', branchId)
      .set('YearId', yearId)
      .set('DealerTypeId', dealerTypeId)
      .set('CurrencyId', currencyId)
      .set('CurrRate', currRate)
    return this.http.get(`${environment.apiURL_Main}/api/PayablesReport/GetSuppliersBalanceByYear/${lang}/${companyId}/${userId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }  

  public GetreportByMonth( 
    supplierId:number,
    status: number,
    branchId: number,
    monthYearId: number,
    dealerTypeId:number,
    currencyId:number,
    currRate:number,
  ): Observable<any> {
    debugger
    const lang = this.jwtAuth.getLang();
    const companyId = this.jwtAuth.getCompanyId();
    const userId = this.jwtAuth.getUserId();
    
    const params = new HttpParams()
      .set('SupplierId', supplierId)
      .set('Status', status)
      .set('BranchId', branchId)
      .set('YearId', monthYearId)
      .set('DealerTypeId', dealerTypeId)
      .set('CurrencyId', currencyId)
      .set('CurrRate', currRate)
    return this.http.get(`${environment.apiURL_Main}/api/PayablesReport/GetSupplierBalanceByMonth/${lang}/${companyId}/${userId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }  
  public GetreportByBranch( 
    DealerId:number,
    voucherStatus: number,
    branchIds: string,
    toDate: string,
    dealerTypeId: number,
    currencyId: number,
    currRate: number
  ): Observable<any> {
    debugger
    const lang = this.jwtAuth.getLang();
    const companyId = this.jwtAuth.getCompanyId();
    const userId = this.jwtAuth.getUserId();
    
    const params = new HttpParams()
      .set('DealerId', DealerId)
      .set('VoucherStatus', voucherStatus)
      .set('BranchIds', branchIds)
      .set('ToDate', toDate)
      .set('DealerTypeId', dealerTypeId)
      .set('CurrencyId', currencyId)
      .set('CurrRate', currRate)
    return this.http.get(`${environment.apiURL_Main}/api/PayablesReport/GetSuppliersBalanceByBranch/${lang}/${companyId}/${userId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }  
//#endregion


//#region  Supplier Account Statement 
public GetSupplierAccountStatementForm(): Observable<any> {
  debugger
  return this.http.get(`${environment.apiURL_Main + '/api/PayablesReport/GetSupplierAccountStatementForm/' + this.jwtAuth.getLang()
    + '/' + this.jwtAuth.getCompanyId()  + '/' +this.jwtAuth.getUserId() } `)
    .pipe(
      catchError(this.handleError)
    )
}

public GetSupplierAccountStatement( 
  supplierId:number,
  voucherStatus: number,
  branchId: number,
  fromDate:string,
  toDate: string,
  dealerTypeId: number,
  currencyId:number,
  currRate:number,

): Observable<any> {
  debugger
  const lang = this.jwtAuth.getLang();
  const companyId = this.jwtAuth.getCompanyId();
  const userId = this.jwtAuth.getUserId();
  
  const params = new HttpParams()
    .set('SupplierId', supplierId)
    .set('Status', voucherStatus)
    .set('BranchId', branchId)
    .set('FromDate', fromDate)
    .set('ToDate', toDate)
    .set('DealerTypeId', dealerTypeId)
    .set('CurrencyId', currencyId)
    .set('CurrRate', currRate)
  return this.http.get(`${environment.apiURL_Main}/api/PayablesReport/GetSupplierAccountStatement/${lang}/${companyId}/${userId}`, { params })
    .pipe(
      catchError(this.handleError)
    );
}  
//#endregion

  
 //#region  Supplier Transactions 
public GetSupplierTransactionsForm(): Observable<any> {
  debugger
  return this.http.get(`${environment.apiURL_Main + '/api/PayablesReport/GetSupplierTransactionsForm/' + this.jwtAuth.getLang()
    + '/' + this.jwtAuth.getCompanyId()  + '/' +this.jwtAuth.getUserId() } `)
    .pipe(
      catchError(this.handleError)
    )
}

public GetSupplierTransactions( 
  supplierId:number,
  voucherTypeId:number,
  voucherStatus: number,
  branchId: number,
  fromDate:string,
  toDate: string,
  note:string,
  dealerTypeId:number,
  currencyId:number,
  currRate:number,
): Observable<any> {
  debugger
  const lang = this.jwtAuth.getLang();
  const companyId = this.jwtAuth.getCompanyId();
  const userId = this.jwtAuth.getUserId();
  
  const params = new HttpParams()
    .set('SupplierId', supplierId)
    .set('VouhcerTypeId', voucherTypeId)    
    .set('Status', voucherStatus)
    .set('BranchId', branchId)
    .set('FromDate', fromDate)
    .set('ToDate', toDate)
    .set('Note', note)
    .set('DealerTypeId', dealerTypeId)
    .set('CurrencyId', currencyId)
    .set('CurrRate', currRate)
  return this.http.get(`${environment.apiURL_Main}/api/PayablesReport/GetSupplierTransactions/${lang}/${companyId}/${userId}`, { params })
    .pipe(
      catchError(this.handleError)
    );
}  
//#endregion 


//#region Supplier Aging 
public GetSupplierAgingForm(): Observable<any> {
  debugger
  return this.http.get(`${environment.apiURL_Main + '/api/PayablesReport/GetSupplierAgingForm/' + this.jwtAuth.getLang()
    + '/' + this.jwtAuth.getCompanyId()  + '/' +this.jwtAuth.getUserId() } `)
    .pipe(
      catchError(this.handleError)
    )
}

public GetSupplierAging( 
  supplierId:number,
  voucherStatus: number,
  toDate: string,
  categoryId:number,
  classId:number,
  branchId: number,
  employeeId:number, 
  period:number,
  dealerTypeId:number,
  currencyId:number,
  currRate:number
): Observable<any> {
  debugger
  const lang = this.jwtAuth.getLang();
  const companyId = this.jwtAuth.getCompanyId();
  const userId = this.jwtAuth.getUserId();
  
  const params = new HttpParams()
    .set('SupplierId', supplierId)
    .set('Status', voucherStatus)
    .set('ToDate', toDate)
    .set('CustomerCategory', categoryId)    
    .set('CustomerClass', classId)    
    .set('BranchId', branchId)
    .set('EmpId', employeeId)    
    .set('Period', period)
    .set('DealerTypeId', dealerTypeId)
    .set('CurrencyId', currencyId)
    .set('CurrRate', currRate)
  return this.http.get(`${environment.apiURL_Main}/api/PayablesReport/GetSupplierAging/${lang}/${companyId}/${userId}`, { params })
    .pipe(
      catchError(this.handleError)
    );
}  
//#endregion



//#region  Other Services 


public GetPeriodFiscalYear( 
  yearId:number,

): Observable<any> {
  debugger
  const lang = this.jwtAuth.getLang();
  const companyId = this.jwtAuth.getCompanyId();
  const userId = this.jwtAuth.getUserId();
  
  const params = new HttpParams()
    .set('YearId', yearId)
  return this.http.get(`${environment.apiURL_Main}/api/AccountingReports/GetPeriodsFiscalYearsList/${lang}/${companyId}/${userId}`, { params })
    .pipe(
      catchError(this.handleError)
    );
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
//#endregion
 
public GetInvoiceId(id): Observable<any> {
  debugger
  return this.http.get(`${environment.apiURL_Main + '/api/InventoryReports/GetInvoiceIdFromAcc/' + id } `)
    .pipe(
      catchError(this.handleError)
    )
}



public GetSupplierPaidBillsForm(): Observable<any> {
  debugger
  return this.http.get(`${environment.apiURL_Main + '/api/PayablesReport/GetSupplierPaidBillsForm/' + this.jwtAuth.getLang()
    + '/' + this.jwtAuth.getCompanyId()  + '/' +this.jwtAuth.getUserId() } `)
    .pipe(
      catchError(this.handleError)
    )
}

public GetPaidBills( 
  customerId:number,
  vouchertypeId:number,
  fromDate:string,
  toDate: string,
  fromVoucher: string,
  toVoucher: string,
  dealerTypeId: number,
  currencyId:number,
  currRate:number,
): Observable<any> {
  debugger
  const lang = this.jwtAuth.getLang();
  const companyId = this.jwtAuth.getCompanyId();
  const userId = this.jwtAuth.getUserId();
  
  const params = new HttpParams()
    .set('CustomerId', customerId)
    .set('VoucherTypeId', vouchertypeId)    
    .set('FromDate', fromDate)
    .set('ToDate', toDate)
    .set('FromDate', fromDate)
    .set('FromVoucher', fromVoucher)
    .set('ToVoucher', toVoucher)    
    .set('DealerTypeId', dealerTypeId)
    .set('CurrencyId', currencyId)
    .set('CurrRate', currRate)
  return this.http.get(`${environment.apiURL_Main}/api/PayablesReport/GetSupplierPaidBills/${lang}/${companyId}/${userId}`, { params })
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
