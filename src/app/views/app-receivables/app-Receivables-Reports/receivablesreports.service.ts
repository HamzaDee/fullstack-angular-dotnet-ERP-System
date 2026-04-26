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
export class CustomerReportsService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }
 
//#region  Customer Balance

  public GetCustomerBalanceForm(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/CustomerReports/GetCustomerBalanceForm/' + this.jwtAuth.getLang()
      + '/' + this.jwtAuth.getCompanyId()  + '/' +this.jwtAuth.getUserId() } `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public Getreportstanderd( 
    dealerId:number,
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
      .set('CustomerId', dealerId)
      .set('ToDate', toDate)
      .set('Status', status)
      .set('BranchId', branchId)
      .set('DealerTypeId', dealerTypeId)
      .set('CurrencyId', currencyId)
      .set('CurrRate', currRate)
    return this.http.get(`${environment.apiURL_Main}/api/CustomerReports/GetCustomerBalance/${lang}/${companyId}/${userId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }  

  public GetreportByYear( 
    supplierId:number,
    status: number,
    branchId: number,
    yearId: number,
    currencyId:number,
    currRate:number
  ): Observable<any> {
    debugger
    const lang = this.jwtAuth.getLang();
    const companyId = this.jwtAuth.getCompanyId();
    const userId = this.jwtAuth.getUserId();
    
    const params = new HttpParams()
      .set('CustomerId', supplierId)
      .set('Status', status)
      .set('BranchId', branchId)
      .set('YearId', yearId)
      .set('CurrencyId', currencyId)
      .set('CurrRate', currRate)
    return this.http.get(`${environment.apiURL_Main}/api/CustomerReports/GetCustomersBalanceByYear/${lang}/${companyId}/${userId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }  

  public GetreportByMonth( 
    dealerId:number,
    status: number,
    branchId: number,
    monthYearId: number,
    dealerTypeId: number,
    currencyId:number,
    currRate:number
  ): Observable<any> {
    debugger
    const lang = this.jwtAuth.getLang();
    const companyId = this.jwtAuth.getCompanyId();
    const userId = this.jwtAuth.getUserId();
    
    const params = new HttpParams()
      .set('CustomerId', dealerId)
      .set('Status', status)
      .set('BranchId', branchId)
      .set('YearId', monthYearId)
      .set('DealerTypeId', dealerTypeId)
      .set('CurrencyId', currencyId)
      .set('CurrRate', currRate)
    return this.http.get(`${environment.apiURL_Main}/api/CustomerReports/GetCustomerBalanceByMonth/${lang}/${companyId}/${userId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }  
/* 
  public GetreportByBranch( 
    parentAccountId:number,
    voucherStatus: number,
    branchIds: string,
    toDate: string,
  ): Observable<any> {
    debugger
    const lang = this.jwtAuth.getLang();
    const companyId = this.jwtAuth.getCompanyId();
    const userId = this.jwtAuth.getUserId();
    
    const params = new HttpParams()
      .set('ParentAcc', parentAccountId)
      .set('VoucherStatus', voucherStatus)
      .set('BranchIds', branchIds)
      .set('ToDate', toDate)
    return this.http.get(`${environment.apiURL_Main}/api/AccountingReports/GetAccountsBalanceByBranch/${lang}/${companyId}/${userId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }  */

      public GetreportByBranch( 
        DealerId:number,
        voucherStatus: number,
        branchIds: string,
        toDate: string,
        dealerTypeId: number,
        currencyId:number,
        currRate:number
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
        return this.http.get(`${environment.apiURL_Main}/api/CustomerReports/GetCustomersBalanceByBranch/${lang}/${companyId}/${userId}`, { params })
          .pipe(
            catchError(this.handleError)
          );
      } 
//#endregion

//#region Customer Account Statement
public GetCustomeraccountStatmentForm(): Observable<any> {
  debugger
  return this.http.get(`${environment.apiURL_Main + '/api/CustomerReports/GetCustomersAccountStatementForm/' + this.jwtAuth.getLang()
    + '/' + this.jwtAuth.getCompanyId()  + '/' +this.jwtAuth.getUserId() } `)
    .pipe(
      catchError(this.handleError)
    )
}

public GetCustomersAccountStatement( 
  customerId:number,
  voucherStatus: number,
  branchId: number,
  fromDate:string,
  toDate: string,  
  dealerTypeId:number,
  currencyId:number,
  currRate:number,
  areaId:number,
  empId:number,
): Observable<any> {
  debugger
  const lang = this.jwtAuth.getLang();
  const companyId = this.jwtAuth.getCompanyId();
  const userId = this.jwtAuth.getUserId();
  
  const params = new HttpParams()
    .set('CustomerId', customerId)
    .set('Status', voucherStatus)
    .set('BranchId', branchId)
    .set('FromDate', fromDate)
    .set('ToDate', toDate)
    .set('DealerTypeId', dealerTypeId)
    .set('CurrencyId', currencyId)
    .set('CurrRate', currRate)
    .set('AreaId', areaId)
    .set('EmpId', empId)
  return this.http.get(`${environment.apiURL_Main}/api/CustomerReports/GetCustomerAccountStatement/${lang}/${companyId}/${userId}`, { params })
    .pipe(
      catchError(this.handleError)
    );
}  

//#endregion

//#region  Cutomer Transactions
public GetCustomerTransactionsForm(): Observable<any> {
  debugger
  return this.http.get(`${environment.apiURL_Main + '/api/CustomerReports/GetCustomerTransactionsForm/' + this.jwtAuth.getLang()
    + '/' + this.jwtAuth.getCompanyId()  + '/' +this.jwtAuth.getUserId() } `)
    .pipe(
      catchError(this.handleError)
    )
}

public GetCustomersByEmp(empId,areaId): Observable<any> {
  debugger
  return this.http.get(`${environment.apiURL_Main + '/api/CustomerReports/GetCustomersByEmp/' + empId
    + '/' + areaId} `)
    .pipe(
      catchError(this.handleError)
    )
}

public GetCustomerTransactions( 
  customerId:number,
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
    .set('CustomerId', customerId)
    .set('VouhcerTypeId', voucherTypeId)    
    .set('Status', voucherStatus)
    .set('BranchId', branchId)
    .set('FromDate', fromDate)
    .set('ToDate', toDate)
    .set('Note', note)    
    .set('DealerTypeId', dealerTypeId)
    .set('CurrencyId', currencyId)
    .set('CurrRate', currRate)
  return this.http.get(`${environment.apiURL_Main}/api/CustomerReports/GetCustomerTransactions/${lang}/${companyId}/${userId}`, { params })
    .pipe(
      catchError(this.handleError)
    );
}  
//#endregion


//#region Other Services
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
//#region 
 
//#region Customer Aging 
public GetCustomerAgingForm(): Observable<any> {
  debugger
  return this.http.get(`${environment.apiURL_Main + '/api/CustomerReports/GetCustomerAgingForm/' + this.jwtAuth.getLang()
    + '/' + this.jwtAuth.getCompanyId()  + '/' +this.jwtAuth.getUserId() } `)
    .pipe(
      catchError(this.handleError)
    )
}

public GetCustomerAging( 
  customerId:number,
  voucherStatus: number,
  toDate: string,
  categoryId:number,
  classId:number,
  branchId: number,
  employeeId:number, 
  period:number,
  dealerTypeId:number,
  currencyId:number,
  currRate:number,
  areaId:number,
): Observable<any> {
  debugger
  const lang = this.jwtAuth.getLang();
  const companyId = this.jwtAuth.getCompanyId();
  const userId = this.jwtAuth.getUserId();
  
  const params = new HttpParams()
    .set('CustomerId', customerId)
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
    .set('AreaId', areaId)
  return this.http.get(`${environment.apiURL_Main}/api/CustomerReports/GetCustomerAging/${lang}/${companyId}/${userId}`, { params })
    .pipe(
      catchError(this.handleError)
    );
}  
//#endregion
 
public GetInvoiceId(id): Observable<any> {
  debugger
  return this.http.get(`${environment.apiURL_Main + '/api/InventoryReports/GetInvoiceIdFromAcc/' + id } `)
    .pipe(
      catchError(this.handleError)
    )
}

public GetPaidBillsForm(): Observable<any> {
  debugger
  return this.http.get(`${environment.apiURL_Main + '/api/CustomerReports/GetPaidBillsForm/' + this.jwtAuth.getLang()
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
  return this.http.get(`${environment.apiURL_Main}/api/CustomerReports/GetPaidBills/${lang}/${companyId}/${userId}`, { params })
    .pipe(
      catchError(this.handleError)
    );
}  
//#region  PaidBills 

//#endregion

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
