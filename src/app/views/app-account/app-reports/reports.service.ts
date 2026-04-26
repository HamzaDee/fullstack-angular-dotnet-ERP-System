import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { formatDate } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }

  public GetaccountbalanceForm(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/AccountingReports/GetAccountBalanceForm/' + this.jwtAuth.getLang()
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public Getreportstanderd(
    parentAccountId: number,
    toDate: string,
    branchId: number,
    voucherStatus: number,
    currencyId: number,
    currRate: number,
    zerobalance: number,
  ): Observable<any> {
    debugger
    const lang = this.jwtAuth.getLang();
    const companyId = this.jwtAuth.getCompanyId();
    const userId = this.jwtAuth.getUserId();

    const params = new HttpParams()
      .set('ParentAccId', parentAccountId)
      .set('ToDate', toDate)
      .set('VoucherStatus', voucherStatus)
      .set('BranchId', branchId)
      .set('CurrencyId', currencyId)
      .set('CurrRate', currRate)
      .set('ZeroBalance', zerobalance)

    return this.http.get(`${environment.apiURL_Main}/api/AccountingReports/GetAccountBalance/${lang}/${companyId}/${userId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  public SavePostingVoucher(post): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    debugger
    return this.http.post<any>(`${environment.apiURL_Main + '/api/Posting/EditIsPosted/'
      + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`, JSON.stringify(post), httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetreportByYear(
    parentAccountId: number,
    voucherStatus: number,
    branchId: number,
    yearId: number,
    currencyId: number,
    currRate: number,
    zerobalance: number,
  ): Observable<any> {
    debugger
    const lang = this.jwtAuth.getLang();
    const companyId = this.jwtAuth.getCompanyId();
    const userId = this.jwtAuth.getUserId();

    const params = new HttpParams()
      .set('ParentAcc', parentAccountId)
      .set('VoucherStatus', voucherStatus)
      .set('BranchId', branchId)
      .set('YearId', yearId)
      .set('CurrencyId', currencyId)
      .set('CurrRate', currRate)
      .set('ZeroBalance', zerobalance)
    return this.http.get(`${environment.apiURL_Main}/api/AccountingReports/GetAccountsBalanceByYear/${lang}/${companyId}/${userId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  public GetreportByMonth(
    parentAccountId: number,
    voucherStatus: number,
    branchId: number,
    monthYearId: number,
    currencyId: number,
    currRate: number,
    zerobalance: number,
  ): Observable<any> {
    debugger
    const lang = this.jwtAuth.getLang();
    const companyId = this.jwtAuth.getCompanyId();
    const userId = this.jwtAuth.getUserId();

    const params = new HttpParams()
      .set('ParentAcc', parentAccountId)
      .set('VoucherStatus', voucherStatus)
      .set('BranchId', branchId)
      .set('YearId', monthYearId)
      .set('CurrencyId', currencyId)
      .set('CurrRate', currRate)
      .set('ZeroBalance', zerobalance)
    return this.http.get(`${environment.apiURL_Main}/api/AccountingReports/GetAccountBalanceByMonth/${lang}/${companyId}/${userId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  public GetPeriodFiscalYear(
    yearId: number,

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

  public GetPeriods(
    yearId: number,

  ): Observable<any> {
    debugger
    const lang = this.jwtAuth.getLang();
    const companyId = this.jwtAuth.getCompanyId();
    const userId = this.jwtAuth.getUserId();

    const params = new HttpParams()
      .set('PeriodId', yearId)
    return this.http.get(`${environment.apiURL_Main}/api/AccountingReports/GetPeriods/${lang}/${companyId}/${userId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  public GetreportByBranch(
    parentAccountId: number,
    voucherStatus: number,
    branchIds: string,
    toDate: string,
    currencyId: number,
    currRate: number,
    zerobalance: number,

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
      .set('CurrencyId', currencyId)
      .set('CurrRate', currRate)
      .set('ZeroBalance', zerobalance)
    return this.http.get(`${environment.apiURL_Main}/api/AccountingReports/GetAccountBalanceByBranches/${lang}/${companyId}/${userId}`, { params })
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

  public GetaccountStatmentForm(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/AccountingReports/GetAccountStatementForm/' + this.jwtAuth.getLang()
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetAccountStatement(
    accId: number,
    voucherStatus: number,
    branchId: number,
    fromdate: string,
    toDate: string,
    exRate: number,
    user: number,
    currencyId: number,
  ): Observable<any> {
    debugger
    const lang = this.jwtAuth.getLang();
    const companyId = this.jwtAuth.getCompanyId();
    const userId = this.jwtAuth.getUserId();

    const params = new HttpParams()
      .set('AccountId', accId)
      .set('VoucherStatus', voucherStatus)
      .set('BranchId', branchId)
      .set('FromDate', fromdate)
      .set('ToDate', toDate)
      .set('ExRate', exRate)
      .set('User', user)
      .set('CurrencyId', currencyId)
    return this.http.get(`${environment.apiURL_Main}/api/AccountingReports/GetAccountStatement/${lang}/${companyId}/${userId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  public GetTrailBalanceForm(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/AccountingReports/GetTraialBalanceForm/' + this.jwtAuth.getLang()
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetBalanceSheetForm(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/AccountingReports/GetBalanceSheetForm/' + this.jwtAuth.getLang()
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetbranchedaccountstatmentForm(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/AccountingReports/GetbranchedaccountstatmentForm/' + this.jwtAuth.getLang()
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetBranchedAccBalance(
    accId: number,
    status: number,
    branchId: number,
    fromdate: string,
    toDate: string,
    costCenterId: number,
    currencyId: number,
    level: number,
    exRate: number,
    zerobalance: number,
    branchedacc: number,
    mainacc: number,


  ): Observable<any> {
    debugger
    const lang = this.jwtAuth.getLang();
    const companyId = this.jwtAuth.getCompanyId();
    const userId = this.jwtAuth.getUserId();

    const params = new HttpParams()
      .set('AccountId', accId)
      .set('Status', status)
      .set('BranchId', branchId)
      .set('FromDate', fromdate)
      .set('ToDate', toDate)
      .set('CostCenterId', costCenterId)
      .set('CurrencyId', currencyId)
      .set('Level', level)
      .set('ExRate', exRate)
      .set('ZeroBalance', zerobalance)
      .set('BranchedAccounts', branchedacc)
      .set('MainAccounts', mainacc)
    return this.http.get(`${environment.apiURL_Main}/api/AccountingReports/GetBranchedAccBalance/${lang}/${companyId}/${userId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  public GetincomestatementForm(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/AccountingReports/GetincomestatementForm/' + this.jwtAuth.getLang()
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetTrialBalance(
    accId: number,
    status: number,
    branchId: number,
    fromdate: string,
    toDate: string,
    costCenterId: number,
    currencyId: number,
    level: number,
    exRate: number,
    zerobalance: number,
    branchedacc: number,
    mainacc: number,


  ): Observable<any> {
    debugger
    const lang = this.jwtAuth.getLang();
    const companyId = this.jwtAuth.getCompanyId();
    const userId = this.jwtAuth.getUserId();

    const params = new HttpParams()
      .set('AccountId', accId)
      .set('Status', status)
      .set('BranchId', branchId)
      .set('FromDate', fromdate)
      .set('ToDate', toDate)
      .set('CostCenterId', costCenterId)
      .set('CurrencyId', currencyId)
      .set('Level', level)
      .set('ExRate', exRate)
      .set('ZeroBalance', zerobalance)
      .set('BranchedAccounts', branchedacc)
      .set('MainAccounts', mainacc)
    return this.http.get(`${environment.apiURL_Main}/api/AccountingReports/GetTrialBalance/${lang}/${companyId}/${userId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  public GetTrialBalanceByYears(
    accId: number,
    status: number,
    branchId: number,
    costCenterId: number,
    currencyId: number,
    level: number,
    exRate: number,
    branchedacc: number,
    mainacc: number,
    year1: number,
    year2: number,



  ): Observable<any> {
    debugger
    const lang = this.jwtAuth.getLang();
    const companyId = this.jwtAuth.getCompanyId();
    const userId = this.jwtAuth.getUserId();

    const params = new HttpParams()
      .set('AccountId', accId)
      .set('Status', status)
      .set('BranchId', branchId)
      .set('CostCenterId', costCenterId)
      .set('CurrencyId', currencyId)
      .set('Level', level)
      .set('ExRate', exRate)
      .set('BranchedAccounts', branchedacc)
      .set('MainAccounts', mainacc)
      .set('Year1', year1)
      .set('Year2', year2)
    return this.http.get(`${environment.apiURL_Main}/api/AccountingReports/GetTrialBalanceByYears/${lang}/${companyId}/${userId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  public GetBalanceSheet(
    status: number,
    branchId: number,
    toDate: string,
    costCenterId: number,
    currencyId: number,
    level: number,
    exRate: number,
    zerobalance: number,
    branchedacc: number,
    mainacc: number,
    invValue: number,

  ): Observable<any> {
    debugger
    const lang = this.jwtAuth.getLang();
    const companyId = this.jwtAuth.getCompanyId();
    const userId = this.jwtAuth.getUserId();

    const params = new HttpParams()
      .set('Status', status)
      .set('BranchId', branchId)
      .set('ToDate', toDate)
      .set('CostCenterId', costCenterId)
      .set('CurrencyId', currencyId)
      .set('Level', level)
      .set('ExRate', exRate)
      .set('ZeroBalance', zerobalance)
      .set('BranchedAccounts', branchedacc)
      .set('MainAccounts', mainacc)
      .set('InvValue', invValue)
    return this.http.get(`${environment.apiURL_Main}/api/AccountingReports/GetBalanceSheet/${lang}/${companyId}/${userId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  public GetIncomeStatement(
    status: number,
    branchId: number,
    toDate: string,
    accId: number,
    currencyId: number,
    level: number,
    exRate: number,
    zerobalance: number,
    branchedacc: number,
    mainacc: number,
  ): Observable<any> {
    const lang = this.jwtAuth.getLang();
    const companyId = this.jwtAuth.getCompanyId();
    const userId = this.jwtAuth.getUserId();

    const params = new HttpParams()
      .set('Status', status)
      .set('BranchId', branchId)
      .set('ToDate', toDate)
      .set('AccountId', accId)
      .set('CurrencyId', currencyId)
      .set('Level', level)
      .set('ExRate', exRate)
      .set('ZeroBalance', zerobalance)
      .set('BranchedAccounts', branchedacc)
      .set('MainAccounts', mainacc)

    return this.http.get(`${environment.apiURL_Main}/api/AccountingReports/GetIncomeStatment/${lang}/${companyId}/${userId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  public GetIncomeStatementByYears(
    status: number,
    branchId: number,
    toDate: string,
    accId: number,
    currencyId: number,
    level: number,
    exRate: number,
    zerobalance: number,
    branchedacc: number,
    mainacc: number,
    year1: number,
    year2: number,



  ): Observable<any> {
    debugger
    const lang = this.jwtAuth.getLang();
    const companyId = this.jwtAuth.getCompanyId();
    const userId = this.jwtAuth.getUserId();

    const params = new HttpParams()
      .set('Status', status)
      .set('BranchId', branchId)
      .set('ToDate', toDate)
      .set('AccountId', accId)
      .set('CurrencyId', currencyId)
      .set('Level', level)
      .set('ExRate', exRate)
      .set('ZeroBalance', zerobalance)
      .set('BranchedAccounts', branchedacc)
      .set('MainAccounts', mainacc)
      .set('Year1', year1)
      .set('Year2', year2)
    return this.http.get(`${environment.apiURL_Main}/api/AccountingReports/GetTrialBalanceByYears/${lang}/${companyId}/${userId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  public GetCostCenterBalanceForm(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/AccountingReports/GetCostCeneterBalancesForm/' + this.jwtAuth.getLang()
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetCostCenterBalance(
    costCenterId: number,
    status: number,
    branchId: number,
    accId: number,
    todate: string,
    showtotals: number,
    currencyId: number,
    exRate: number,
  ): Observable<any> {
    debugger
    const lang = this.jwtAuth.getLang();
    const companyId = this.jwtAuth.getCompanyId();
    const userId = this.jwtAuth.getUserId();

    const params = new HttpParams()
      .set('ParentCostCenter', costCenterId)
      .set('Status', status)
      .set('BranchId', branchId)
      .set('AccountId', accId)
      .set('ToDate', todate)
      .set('AccordingToAccount', showtotals)
      .set('CurrencyId', currencyId)
      .set('ExRate', exRate)
    return this.http.get(`${environment.apiURL_Main}/api/AccountingReports/GetCostCenterBalances/${lang}/${companyId}/${userId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  public GetCostCenterTransactionsForm(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/AccountingReports/GetCostTransactionsForm/' + this.jwtAuth.getLang()
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetCostCenterTransactions(
    accId: number,
    costCenterId: number,
    status: number,
    branchId: number,
    fromdate: string,
    todate: string,
    showAccountstotals: number,
    showCosttotals: number,
    currencyId: number,
    exRate: number,

  ): Observable<any> {
    debugger
    const lang = this.jwtAuth.getLang();
    const companyId = this.jwtAuth.getCompanyId();
    const userId = this.jwtAuth.getUserId();

    const params = new HttpParams()
      .set('AccountId', accId)
      .set('CostCenterId', costCenterId)
      .set('Status', status)
      .set('BranchId', branchId)
      .set('FromDate', fromdate)
      .set('ToDate', todate)
      .set('ShowTotalAccount', showCosttotals)
      .set('ShowTotalCostCenter', showAccountstotals)
      .set('CurrencyId', currencyId)
      .set('ExRate', exRate)
    return this.http.get(`${environment.apiURL_Main}/api/AccountingReports/GetCostCenterTransactions/${lang}/${companyId}/${userId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  public GetBudgetsForm(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/AccountingReports/GetBudgetsForm/' + this.jwtAuth.getLang()
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetBudgets(
    accId: number,
    status: number,
    branchId: number,
    yearId: number,
    monthId: number,
    currencyId: number,
    exRate: number,
  ): Observable<any> {
    debugger
    const lang = this.jwtAuth.getLang();
    const companyId = this.jwtAuth.getCompanyId();
    const userId = this.jwtAuth.getUserId();

    const params = new HttpParams()
      .set('AccountId', accId)
      .set('Status', status)
      .set('BranchId', branchId)
      .set('YearId', yearId)
      .set('MonthId', monthId)
      .set('CurrencyId', currencyId)
      .set('ExRate', exRate)
    return this.http.get(`${environment.apiURL_Main}/api/AccountingReports/GetAccountBudgets/${lang}/${companyId}/${userId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  public GetCostCenterBudgetsForm(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/AccountingReports/GetCostCenterBudgetsFormModel/' + this.jwtAuth.getLang()
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetCostCenterBudgets(
    costcenterId: number,
    status: number,
    branchId: number,
    yearId: number,
    monthId: number,

  ): Observable<any> {
    debugger
    const lang = this.jwtAuth.getLang();
    const companyId = this.jwtAuth.getCompanyId();
    const userId = this.jwtAuth.getUserId();

    const params = new HttpParams()
      .set('CostCenterId', costcenterId)
      .set('Status', status)
      .set('BranchId', branchId)
      .set('YearId', yearId)
      .set('MonthId', monthId)


    return this.http.get(`${environment.apiURL_Main}/api/AccountingReports/GetCostCenterBudgetsRep/${lang}/${companyId}/${userId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  public GetVoucherTransactionsForm(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/AccountingReports/GetVouchersTransactionsForm/' + this.jwtAuth.getLang()
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetVoucherTransactions(
    costcenterId: number,
    accountId: number,
    voucherStatus: number,
    note: string,
    branchId: number,
    fromdate: Date,
    todate: Date,
    voucherNoFrom: string,
    voucherNoTo: string,
    voucherTypes: string,


  ): Observable<any> {
    debugger
    const lang = this.jwtAuth.getLang();
    const companyId = this.jwtAuth.getCompanyId();
    const userId = this.jwtAuth.getUserId();

    const params = new HttpParams()
      .set('CostCenterId', costcenterId)
      .set('AccountId', accountId)
      .set('VoucherStatus', voucherStatus)
      .set('Note', note)
      .set('BranchId', branchId)
      .set('FromDate', formatDate(fromdate, "yyyy-MM-dd", "en-US"))
      .set('ToDate', formatDate(todate, "yyyy-MM-dd", "en-US"))
      .set('VoucherNoFrom', voucherNoFrom)
      .set('VoucherNoTo', voucherNoTo)
      .set('VoucherTypes', voucherTypes)


    return this.http.get(`${environment.apiURL_Main}/api/AccountingReports/GetTransactionsVouchers/${lang}/${companyId}/${userId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  public GetChequesForm(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/AccountingReports/GetCheqsForm/' + this.jwtAuth.getLang()
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetCheques(
    accountId: number,
    bankId: number,
    branchId: number,
    chequeStatusId: number,
    voucherTypes: string,
    drawerName: string,
    fromChequeNo: number,
    toChequeNo: number,
    fromAmount: number,
    toAmount: number,
    fromDate: Date,
    toDate: Date,

  ): Observable<any> {
    debugger
    const lang = this.jwtAuth.getLang();
    const companyId = this.jwtAuth.getCompanyId();
    const userId = this.jwtAuth.getUserId();

    const params = new HttpParams()
      .set('AccountId', accountId)
      .set('BankId', bankId)
      .set('BranchId', branchId)
      .set('ChequeStatusId', chequeStatusId)
      .set('VoucherTypes', voucherTypes)
      .set('DrawerName', drawerName)
      .set('FromChequeNo', fromChequeNo)
      .set('ToChequeNo', toChequeNo)
      .set('FromAmount', fromAmount)
      .set('ToAmount', toAmount)
      .set('FromDate', formatDate(fromDate, "yyyy-MM-dd", "en-US"))
      .set('ToDate', formatDate(toDate, "yyyy-MM-dd", "en-US"))
    return this.http.get(`${environment.apiURL_Main}/api/AccountingReports/GetCheques/${lang}/${companyId}/${userId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  public GetChequesTransForm(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/AccountingReports/GetChequesTranModel/' + this.jwtAuth.getLang()
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetChequesTransactions(
    cheqId: number,
    voucherStatus: number,


  ): Observable<any> {
    debugger
    const lang = this.jwtAuth.getLang();
    const companyId = this.jwtAuth.getCompanyId();
    const userId = this.jwtAuth.getUserId();

    const params = new HttpParams()
      .set('ChequeNo', cheqId)
      .set('IsPosted', voucherStatus)
    return this.http.get(`${environment.apiURL_Main}/api/AccountingReports/GetCheqTransactions/${lang}/${companyId}/${userId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  public GetCurrRateHistoryForm(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/AccountingReports/GetCurrencyPriceForm/' + this.jwtAuth.getLang()
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public FilterCurrencyExchangeRateHistory(
    currencyId: number,
    voucherTypeId: number,
    compareDate: number,
    fromDate: Date,
    toDate: Date,

  ): Observable<any> {
    debugger
    const lang = this.jwtAuth.getLang();
    const companyId = this.jwtAuth.getCompanyId();
    const userId = this.jwtAuth.getUserId();

    const params = new HttpParams()
      .set('CurrencyId', currencyId)
      .set('VoucherTypeId', voucherTypeId)
      .set('CompareDate', compareDate)
      .set('FromDate', formatDate(fromDate, "yyyy-MM-dd", "en-US"))
      .set('ToDate', formatDate(toDate, "yyyy-MM-dd", "en-US"))
    return this.http.get(`${environment.apiURL_Main}/api/AccountingReports/FilterCurrencyExchangeRateHistory/${lang}/${companyId}/${userId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  public GetServicesInvoiceForm(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/AccountingReports/GetServicesInvoicesReportModel/' + this.jwtAuth.getLang()
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetServicesReturnInvoicesReportModel(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/AccountingReports/GetServicesReturnInvoicesReportModel/' + this.jwtAuth.getLang()
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetServiceInvoices(
    fromdate: Date,
    todate: Date,
    voucherNoFrom: number,
    voucherNoTo: number,
    voucherStatus: number,
    serviceId: number,
    vouchertypeId: number,
    note: string,
    employeeId: number,
    branchId: number,
    status: number,
    custName: string,
    accId: number,

  ): Observable<any> {
    debugger
    const lang = this.jwtAuth.getLang();
    const companyId = this.jwtAuth.getCompanyId();
    const userId = this.jwtAuth.getUserId();

    const params = new HttpParams()
      .set('FromDate', formatDate(fromdate, "yyyy-MM-dd", "en-US"))
      .set('ToDate', formatDate(todate, "yyyy-MM-dd", "en-US"))
      .set('FromVoucherNo', voucherNoFrom)
      .set('ToVoucherNo', voucherNoTo)
      .set('VoucherStatus', voucherStatus)
      .set('ServiceId', serviceId)
      .set('VoucherTypeID', vouchertypeId)
      .set('Note', note)
      .set('EmployeeID', employeeId)
      .set('BranchID', branchId)
      .set('Status', status)
      .set('CustomerName', custName)
      .set('AccountId', accId)

    return this.http.get(`${environment.apiURL_Main}/api/AccountingReports/GetServicesInvoices/${lang}/${companyId}/${userId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  public GetProjectBalancesForm(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/AccountingReports/GetProjectBalancesForm/' + this.jwtAuth.getLang()
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetProjectBalances(
    projectId: number,
    status: number,
    branchId: number,
    accId: number,
    todate: string,
    showtotals: number,

  ): Observable<any> {
    debugger
    const lang = this.jwtAuth.getLang();
    const companyId = this.jwtAuth.getCompanyId();
    const userId = this.jwtAuth.getUserId();

    const params = new HttpParams()
      .set('ProjectId', projectId)
      .set('Status', status)
      .set('BranchId', branchId)
      .set('AccountId', accId)
      .set('ToDate', todate)
      .set('AccordingToAccount', showtotals)

    return this.http.get(`${environment.apiURL_Main}/api/AccountingReports/GetProjectBalances/${lang}/${companyId}/${userId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  public GetProjectsTransForm(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/AccountingReports/GetProjectsTransForm/' + this.jwtAuth.getLang()
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetProjectsTransactions(
    accId: number,
    projectId: number,
    status: number,
    branchId: number,
    fromdate: string,
    todate: string,
    showAccountstotals: number,
    showCosttotals: number,


  ): Observable<any> {
    debugger
    const lang = this.jwtAuth.getLang();
    const companyId = this.jwtAuth.getCompanyId();
    const userId = this.jwtAuth.getUserId();

    const params = new HttpParams()
      .set('AccountId', accId)
      .set('ProjectId', projectId)
      .set('Status', status)
      .set('BranchId', branchId)
      .set('FromDate', fromdate)
      .set('ToDate', todate)
      .set('ShowTotalAccount', showCosttotals)
      .set('ShowTotalCostCenter', showAccountstotals)

    return this.http.get(`${environment.apiURL_Main}/api/AccountingReports/GetProjectsTransactions/${lang}/${companyId}/${userId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  public GetUnbalancedTrans(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/AccountingReports/GetUnbalancedTrans/' + this.jwtAuth.getLang()
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public UpdateFavourite(screenId): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post(`${environment.apiURL_Main + '/api/General/UpdateFavourite/'
      + screenId} `, null, httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetFavouriteStatus(screenId) {
    return this.http.get(`${environment.apiURL_Main + '/api/General/GetFavouriteStatus/' + screenId} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetInvoiceId(Id) {
    return this.http.get(`${environment.apiURL_Main + '/api/AccountingReports/GetMainId/' + Id} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetReturnServiceInvoices(
    fromdate: Date,
    todate: Date,
    voucherNoFrom: number,
    voucherNoTo: number,
    voucherStatus: number,
    serviceId: number,
    vouchertypeId: number,
    note: string,
    employeeId: number,
    branchId: number,
    status: number,
    custName: string,


  ): Observable<any> {
    debugger
    const lang = this.jwtAuth.getLang();
    const companyId = this.jwtAuth.getCompanyId();
    const userId = this.jwtAuth.getUserId();

    const params = new HttpParams()
      .set('FromDate', formatDate(fromdate, "yyyy-MM-dd", "en-US"))
      .set('ToDate', formatDate(todate, "yyyy-MM-dd", "en-US"))
      .set('FromVoucherNo', voucherNoFrom)
      .set('ToVoucherNo', voucherNoTo)
      .set('VoucherStatus', voucherStatus)
      .set('ServiceId', serviceId)
      .set('VoucherTypeID', vouchertypeId)
      .set('Note', note)
      .set('EmployeeID', employeeId)
      .set('BranchID', branchId)
      .set('Status', status)
      .set('CustomerName', custName)

    return this.http.get(`${environment.apiURL_Main}/api/AccountingReports/GetReturnServicesInvoices/${lang}/${companyId}/${userId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  public getAccountsGroupsReportForm(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/AccountingReports/GetAccountsGroupsReportForm/' + this.jwtAuth.getLang()
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetAccountsGroupsReport(GroupNo: number, BranchId: number, FromDate: number, ToDate: string): Observable<any> {
    debugger
    const lang = this.jwtAuth.getLang();
    const companyId = this.jwtAuth.getCompanyId();
    const userId = this.jwtAuth.getUserId();

    const params = new HttpParams()
      .set('GroupNo', GroupNo)
      .set('BranchId', BranchId)
      .set('FromDate', FromDate)
      .set('ToDate', ToDate)

    return this.http.get(`${environment.apiURL_Main}/api/AccountingReports/GetAccountsGroupsReport/${lang}/${companyId}/${userId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  public getCreditCardsStatusReportForm(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/AccountingReports/GetCreditCardsStatusForm/' + this.jwtAuth.getLang()
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetCreditCardsStatusReport(
    BranchId: number,
    VoucherTypeId: number,
    FromDate: string,
    ToDate: string,
    CardNo: string,
    IsCollected: number
  ): Observable<any> {
    debugger
    const lang = this.jwtAuth.getLang();
    const companyId = this.jwtAuth.getCompanyId();
    const userId = this.jwtAuth.getUserId();

    const params = new HttpParams()
      .set('branchId', BranchId)
      .set('voucherTypeId', VoucherTypeId)
      .set('fromDate', FromDate)
      .set('toDate', ToDate)
      .set('cardNo', CardNo)
      .set('isCollected', IsCollected);

    return this.http.get(`${environment.apiURL_Main}/api/AccountingReports/GetCreditCardsStatus/${lang}/${companyId}/${userId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }



  public GetRepresentativeCollectionsForm(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/AccountingReports/GetRepresentativeCollectionsForm/' + this.jwtAuth.getLang()
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetRepresentativeCollectionsDetailed(
    fromdate: Date,
    todate: Date,
    branchId: number,
    represntedId: number,
    paymentMethod: number,
    customerId: number,
    collective: number,
  ): Observable<any> {
    debugger
    const lang = this.jwtAuth.getLang();
    const companyId = this.jwtAuth.getCompanyId();
    const userId = this.jwtAuth.getUserId();

    const params = new HttpParams()
      .set('FromDate', formatDate(fromdate, "yyyy-MM-dd", "en-US"))
      .set('ToDate', formatDate(todate, "yyyy-MM-dd", "en-US"))
      .set('BranchId', branchId)
      .set('RepresntedId', represntedId)
      .set('CollectiveType', paymentMethod)
      .set('CustomerId', customerId)
      .set('IsCollective', collective)
    return this.http.get(`${environment.apiURL_Main}/api/AccountingReports/GetRepresentativeCollectionsDetailed/${lang}/${companyId}/${userId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  public GetRepresentativeCollections(
    fromdate: Date,
    todate: Date,
    branchId: number,
    represntedId: number,
    paymentMethod: number,
    customerId: number,
    collective: number,
  ): Observable<any> {
    debugger
    const lang = this.jwtAuth.getLang();
    const companyId = this.jwtAuth.getCompanyId();
    const userId = this.jwtAuth.getUserId();

    const params = new HttpParams()
      .set('FromDate', formatDate(fromdate, "yyyy-MM-dd", "en-US"))
      .set('ToDate', formatDate(todate, "yyyy-MM-dd", "en-US"))
      .set('BranchId', branchId)
      .set('RepresntedId', represntedId)
      .set('CollectiveType', paymentMethod)
      .set('CustomerId', customerId)
      .set('IsCollective', collective)
    return this.http.get(`${environment.apiURL_Main}/api/AccountingReports/GetRepresentativeCollections/${lang}/${companyId}/${userId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  public GetAccountAgingForm(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/AccountingReports/GetAccountsAgingForm/' + this.jwtAuth.getLang()
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetAccountAging(
    accountId: number,
    status:number ,
    toDate: string,
    branchId: number,
    representedId: number,

  ): Observable<any> {
    debugger
    const lang = this.jwtAuth.getLang();
    const companyId = this.jwtAuth.getCompanyId();
    const userId = this.jwtAuth.getUserId();

    const params = new HttpParams()
      .set('AccountId', accountId)
      .set('Status', status)
      .set('ToDate', toDate)
      .set('BranchId', branchId)
      .set('EmpId', representedId)
    return this.http.get(`${environment.apiURL_Main}/api/AccountingReports/GetAccountAging/${lang}/${companyId}/${userId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

}
