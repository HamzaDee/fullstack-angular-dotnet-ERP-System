import { formatDate } from '@angular/common';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { AppEntryvouchersService } from 'app/views/app-account/app-entryvouchers/app-entryvouchers.service';
import { environment } from 'environments/environment';
import { Observable, catchError, throwError } from 'rxjs';

interface LeadData {
  fromDate: any;
  toDate: any;
  branchId: any;
  stageId: any;
  salesUserId: any;
  leadId: any;
  customerId: any;
}


@Component({
  selector: 'app-opportunities-search',
  templateUrl: './opportunities-search.component.html',
  styleUrl: './opportunities-search.component.scss'
})
export class OpportunitiesSearchComponent {
 @Output() searchResultEvent: EventEmitter<any> = new EventEmitter();
  searchCriteria: LeadData;
  data: any;
  showLoader: boolean;
  oldMultiValue: string | string[];
  @Input() vBranchList: any;
  @Input() vStageList: any;
  @Input() vSalesEmployeeList: any;
  @Input() vLeadList: any;
  @Input() vDealersList: any;
  @Input() vfromDate: Date;
  @Input() vtoDate: Date;
  BranchList: any;
  StageList: any;
  SalesEmployeeList: any;
  LeadList: any;
  DealersList: any;

  constructor (
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
    this.BranchList = this.vBranchList;
    this.StageList = this.vStageList;
    this.SalesEmployeeList = this.vSalesEmployeeList;
    this.LeadList = this.vLeadList;
    this.DealersList = this.vDealersList;

    this.searchCriteria = {
      fromDate: this.vfromDate ? formatDate(this.vfromDate, "yyyy-MM-dd", "en-US") : '',
      toDate: this.vtoDate ? formatDate(this.vtoDate, "yyyy-MM-dd", "en-US") : '',
      branchId: 0,
      stageId: 0,
      salesUserId: 0,
      leadId: 0,
      customerId: 0,
    };
  }

  getData() {
    debugger
    this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
    this.GetOpportunitiesSearchList(this.searchCriteria).subscribe(result => {
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

  public GetOpportunitiesSearchList(searchCriteria): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/Opportunities/GetLeadsCustomerListBySearch/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `, JSON.stringify(searchCriteria), httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetOpportunitiesList(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/Opportunities/GetOpportunitiesList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  GetMainData() {
    this.GetOpportunitiesList().subscribe(result => {
      this.data = result;
      this.searchResultEvent.emit(result);
    },
      (error) => {
        console.error('Error occurred:', error);
      })
  }

   EmptySearch() {
    this.showLoader = true;
    this.searchCriteria.branchId = 0;
    this.searchCriteria.stageId = '';
    this.searchCriteria.salesUserId = '';
    this.searchCriteria.leadId = 0;
    this.searchCriteria.customerId = 0;
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
