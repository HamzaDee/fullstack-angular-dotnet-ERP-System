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
  voucherTypes: string | string[];
  status: any;
  branchId: any;
  projectId: any;
  authorityId: any;
  fromVoucherNo: any;
  toVoucherNo: any;
  fromDate: any;
  toDate: any;
  note: any;
}

@Component({
  selector: 'app-inv-search-form',
  templateUrl: './inv-search-form.component.html',
  styleUrls: ['./inv-search-form.component.scss']
})
export class InvSearchFormComponent implements OnInit {
  @Output() searchResultEvent: EventEmitter<any> = new EventEmitter();
  @Input() vTypeList: any;
  @Input() vStatusList: any;
  @Input() vBranchList: any;
  @Input() vprojectsList: any;
  @Input() vauthoritiesDonorList: any;
  @Input() vfromVoucherNo: string;
  @Input() vtoVoucherNo: string;
  @Input() vfromDate: Date;
  @Input() vtoDate: Date;
  @Input() vnote: string;
  @Input() voucherTypeEnum: any;
 loading: boolean;
  voucherTypeList: any;
  userbranchList: any;
  projectsList: any;
  authoritiesDonorList: any;
  statusLists: any;
  searchCriteria: entryVData;
  data: any;
  showLoader: boolean;
  oldMultiValue: string | string[];
  public CompanyName: string = '';

  constructor(private formbulider: FormBuilder,
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

    this.voucherTypeList = this.vTypeList;
    this.statusLists = this.vStatusList;
    this.userbranchList = this.vBranchList;
    this.projectsList = this.vprojectsList;
    this.authoritiesDonorList = this.vauthoritiesDonorList;

    this.searchCriteria = {
      voucherTypes: '',
      status: 0,
      branchId: 0,
      projectId: 0,
      authorityId: 0,
      fromVoucherNo: '',
      toVoucherNo: '',
      fromDate: this.vfromDate ? formatDate(this.vfromDate, "yyyy-MM-dd", "en-US") : '',
      toDate: this.vtoDate ? formatDate(this.vtoDate, "yyyy-MM-dd", "en-US") : '',
      note: ''
    };
  }

  getData() {



    this.oldMultiValue = this.searchCriteria.voucherTypes;
    if (this.searchCriteria.voucherTypes == '') {
      this.searchCriteria.voucherTypes = null;
    }
    if (this.searchCriteria.voucherTypes !== '' && this.searchCriteria.voucherTypes !== null) {
      if (Array.isArray(this.searchCriteria.voucherTypes)) {
        this.searchCriteria.voucherTypes = this.searchCriteria.voucherTypes.join(',');
      }
    }
    if (this.searchCriteria.fromVoucherNo == '') {
      this.searchCriteria.fromVoucherNo = null;
    }
    if (this.searchCriteria.toVoucherNo == '') {
      this.searchCriteria.toVoucherNo = null;
    }
    if (this.searchCriteria.voucherTypes == '') {
      this.searchCriteria.voucherTypes = null;
    }
    if (this.searchCriteria.note == '') {
      this.searchCriteria.note = null;
    }
    if (this.searchCriteria.branchId == null) {
      this.searchCriteria.branchId = 0;
    }
    if (this.searchCriteria.projectId == null) {
      this.searchCriteria.projectId = 0;
    }
    if (this.searchCriteria.authorityId == null) {
      this.searchCriteria.authorityId = 0;
    }
    if (this.searchCriteria.status == null) {
      this.searchCriteria.status = 0;
    }

    this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));

    this.GetEntryVouchersSearchList(this.searchCriteria).subscribe(result => {

      this.data = result;
      this.searchResultEvent.emit(result);
      this.searchCriteria.voucherTypes = this.oldMultiValue;
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
    const url = `${environment.apiURL_Main}/api/InventoryVouchers/GetInvVouchersSearchList/${this.jwtAuth.getLang()}/${this.jwtAuth.getCompanyId()}/${this.jwtAuth.getUserId()}/${this.voucherTypeEnum}`;
    return this.http.post<any>(url, JSON.stringify(searchCriteria), httpOptions)
      .pipe(
        catchError(this.handleError)
      );


    // return this.http.post<any>(`${environment.apiURL_Main + '/api/EntryVouchers/EntryVouchersSearchList/'
    // + this.jwtAuth.getLang() + '/'  + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + this.voucherTypeEnum} `,JSON.stringify(searchCriteria),httpOptions)
    //   .pipe(
    //     catchError(this.handleError)
    //   )   

  }

   AuthloadLazyOptions(event: any) {
    const { first, last } = event;

    // Don't replace the full list; copy and fill only the needed range
    if (!this.projectsList) {
      this.projectsList = [];
    }

    // Make sure the array is large enough
    while (this.projectsList.length < last) {
      this.projectsList.push(null);
    }

    for (let i = first; i < last; i++) {
      this.projectsList[i] = this.projectsList[i];
    }

    this.loading = false;
  }

  public GetAccVouchersList(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/InventoryVouchers/InvVouchersList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + this.voucherTypeEnum} `)
      .pipe(
        catchError(this.handleError)
      )

    // + + '/' this.voucherTypeEnum
  }

  GetMainData() {
    debugger
    this.GetAccVouchersList().subscribe(result => {

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
    this.searchCriteria.projectId = 0;
    this.searchCriteria.authorityId = 0;
    this.searchCriteria.voucherTypes = '';
    this.searchCriteria.status = 0;
    this.searchCriteria.fromVoucherNo = "";
    this.searchCriteria.toVoucherNo = "";
    this.searchCriteria.note = "";
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
