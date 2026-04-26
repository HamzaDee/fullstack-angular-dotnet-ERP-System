import { Component, OnInit, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { formatDate } from '@angular/common';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { InvVoucherService } from 'app/views/app-inventory/app-inventoryService.service';
import { TranslateService } from '@ngx-translate/core';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
interface entryVData {
  leadId: number;
  activityTypeId: number;
  fromStartAt: string | null; 
  toEndAt: string | null;    
  status: any;
  createdById: any;
}
@Component({
  selector: 'app-activityadvancedsearch',
  templateUrl: './activityadvancedsearch.component.html',
  styleUrl: './activityadvancedsearch.component.scss'
})
export class ActivityadvancedsearchComponent {
@Output() searchResultEvent: EventEmitter<any> = new EventEmitter();
  @Input() vStatusList: any;
  @Input() vLeadList: any;
  @Input() vActivityTypeList: any;
  @Input() vfromDate: any;
  @Input() vtoDate: any;
  @Input() vUserList: any;
  UserList: any;
  showLoader:boolean;
  loading: boolean;
  data: any;
  StatusList: any;
  searchCriteria: entryVData;
  leadList: any[] = [];
  activityTypeList: any[] = [];
  public CompanyName: string = '';

  constructor(
    private formbulider: FormBuilder,
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
    private invService: InvVoucherService,
    private egretLoader: AppLoaderService,
    private translateService: TranslateService,) { }

  ngOnInit(): void {
    this.GetSearchFormValues();
    this.CompanyName = window.localStorage.getItem('companyName');
  }

  GetSearchFormValues() {
    this.StatusList = this.vStatusList;
    this.UserList = this.vUserList;
    this.leadList = this.vLeadList;
    this.activityTypeList = this.vActivityTypeList;
    this.searchCriteria = {
     leadId: 0,
     status: 0,
    createdById: 0,
     activityTypeId: 0,
     fromStartAt: this.vfromDate ? formatDate(this.vfromDate, "yyyy-MM-dd", "en-US") : null,
     toEndAt: this.vtoDate ? formatDate(this.vtoDate, "yyyy-MM-dd", "en-US") : null,
};
  }

getData() {    
  
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));

  this.GetEntryVouchersSearchList(this.searchCriteria).subscribe(result => {
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
  public GetEntryVouchersSearchList(searchCriteria): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    const url = `${environment.apiURL_Main}/api/LeadsActivities/SearchLeadsActivitiesList/${this.jwtAuth.getLang()}/${this.jwtAuth.getCompanyId()}/${this.jwtAuth.getUserId()}`;
    return this.http.post<any>(url, JSON.stringify(searchCriteria), httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

   AuthloadLazyOptions(event: any) {
    const { first, last } = event;


    if (!this.leadList) {
      this.leadList = [];
    }

    while (this.leadList.length < last) {
      this.leadList.push(null);
    }

    for (let i = first; i < last; i++) {
      this.leadList[i] = this.leadList[i];
    }

    this.loading = false;
  }

  public GetLeadsActivitiesList(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/LeadsActivities/GetLeadsActivitiesList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )

    // + + '/' this.voucherTypeEnum
  }

  GetMainData() {
    debugger
    this.GetLeadsActivitiesList().subscribe(result => {

      this.data = result;
      this.searchResultEvent.emit(result);
    },
      (error) => {
        console.error('Error occurred:', error);
      })
  }

  EmptySearch() {

    this.searchCriteria.leadId = 0;
    this.searchCriteria.activityTypeId = 0;
    this.searchCriteria.status = 0;
    this.searchCriteria.createdById = 0;
    this.GetSearchFormValues();
    this.GetMainData();
   
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
