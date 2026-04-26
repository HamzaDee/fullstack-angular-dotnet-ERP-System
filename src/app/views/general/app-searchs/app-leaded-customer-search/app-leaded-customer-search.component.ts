import { formatDate } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { AppEntryvouchersService } from 'app/views/app-account/app-entryvouchers/app-entryvouchers.service';
import { environment } from 'environments/environment';
import { catchError, Observable, throwError } from 'rxjs';

interface LeadData {
  leadId: any;
  fromDate: any;
  toDate: any;
  assignedTo: any;
  sourceId: any;
  status: any;
  branchId?: any;
}

@Component({
  selector: 'app-app-leaded-customer-search',
  templateUrl: './app-leaded-customer-search.component.html',
  styleUrl: './app-leaded-customer-search.component.scss'
})
export class AppLeadedCustomerSearchComponent {
  @Output() searchResultEvent: EventEmitter<any> = new EventEmitter();
  searchCriteria: LeadData = {
    leadId: 0,
    fromDate: '',
    toDate: '',
    assignedTo: 0,
    sourceId: 0,
    status: 0,
    branchId: 0
  };
  data: any;
  showLoader: boolean = false;
  oldMultiValue: string | string[] = '';
  @Input() vConvertedToList: any;
  @Input() vSourceList: any;
  @Input() vStatusList: any;
  @Input() vBranchesList: any;
  @Input() vfromDate: Date = new Date();
  @Input() vtoDate: Date = new Date();
  ConvertedToList: any;
  SourceList: any;
  StatusList: any;
  branchesList: any;

  constructor
    (
      private formbulider: FormBuilder,
      private http: HttpClient,
      private jwtAuth: JwtAuthService,
      private appEntryvouchersService: AppEntryvouchersService,
      private translateService: TranslateService,
      private egretLoader: AppLoaderService,
    ) { }

  ngOnInit(): void {
    this.GetSearchFormValues();
  }

  GetSearchFormValues() {
    debugger
    this.ConvertedToList = this.vConvertedToList;
    this.SourceList = this.vSourceList;
    this.StatusList = this.vStatusList;
    this.branchesList = this.vBranchesList;
    this.searchCriteria = {
      leadId: 0,
      fromDate: this.vfromDate ? formatDate(this.vfromDate, "yyyy-MM-dd", "en-US") : '',
      toDate: this.vtoDate ? formatDate(this.vtoDate, "yyyy-MM-dd", "en-US") : '',
      assignedTo: 0,
      sourceId: 0,
      status: 0,
      branchId: 0
    };
  }

  getData() {
    debugger
    this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
    this.GetLeadCustomerSearchList(this.searchCriteria).subscribe(result => {
      debugger
      this.data = result;
      this.searchResultEvent.emit(result);
      this.egretLoader.close();
    },
      (error) => {
        console.error('Error occurred:', error);
        this.egretLoader.close();
      });
  }

  public GetLeadCustomerSearchList(searchCriteria :any): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/LeadsCustomers/GetLeadsCustomerListBySearch/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `, JSON.stringify(searchCriteria), httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetLeadsCustomerList(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/LeadsCustomers/GetLeadsCustomerList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  GetMainData() {
    this.GetLeadsCustomerList().subscribe(result => {
      this.data = result;
      this.searchResultEvent.emit(result);
    },
      (error) => {
        console.error('Error occurred:', error);
      })
  }

  EmptySearch() {
    this.showLoader = true;
    this.searchCriteria.leadId = 0;
    this.searchCriteria.assignedTo = '';
    this.searchCriteria.sourceId = '';
    this.searchCriteria.status = 0;
    this.GetSearchFormValues();
    this.GetMainData();
    this.showLoader = false;
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.log(error.error.message);
    } else {
      console.log(error.status);
    }
    return throwError(
      console.log('Something is wrong!')
    );
  }
}
