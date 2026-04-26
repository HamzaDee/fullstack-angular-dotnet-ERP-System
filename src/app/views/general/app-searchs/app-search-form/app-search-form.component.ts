import { Component, OnInit, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { formatDate } from '@angular/common';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { AppEntryvouchersService } from 'app/views/app-account/app-entryvouchers/app-entryvouchers.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { TranslateService } from '@ngx-translate/core';


interface entryVData {
  voucherTypes: string | string[] | null;
  status: any;
  branchId: any;
  fromVoucherNo: any;
  toVoucherNo: any;
  currencyId: any;
  representId: any;
  fromDate: any;
  toDate: any;
  note: any;
  paymentMethodId: string | string[] | null;
}

@Component({
  selector: 'app-app-search-form',
  templateUrl: './app-search-form.component.html',
  styleUrls: ['./app-search-form.component.scss']
})

export class AppSearchFormComponent implements OnInit {
  @Output() searchResultEvent: EventEmitter<any> = new EventEmitter();
  @Input() vTypeList: any;
  @Input() vStatusList: any;
  @Input() vBranchList: any;
  @Input() vcurrencyList: any;
  @Input() vemployeeList: any;
  @Input() vfromVoucherNo: string = '';
  @Input() vtoVoucherNo: string = '';
  @Input() vfromDate: Date = new Date();
  @Input() vtoDate: Date = new Date();
  @Input() vnote: string = '';
  @Input() voucherTypeEnum: any;
  @Input() vpaymentMethods: any;

  voucherTypeList: any;
  userbranchList: any;
  currancyList: any;
  employeeLists: any;
  statusLists: any;
  searchCriteria: entryVData = {
    voucherTypes: '',
    status: 0,
    branchId: 0,
    fromVoucherNo: '',
    toVoucherNo: '',
    currencyId: 0,
    representId: 0,
    fromDate: '',
    toDate: '',
    note: '',
    paymentMethodId: ''
  };
  data: any;
  showLoader: boolean = false;
  oldMultiValue: string | string[] | null = '';
  paymentMethods: any;
  oldpaymentMethodId: string | string[] | null = '';
  constructor
    (
      private formbulider: FormBuilder,
      private http: HttpClient,
      private jwtAuth: JwtAuthService,
      private appEntryvouchersService: AppEntryvouchersService,
      private egretLoader: AppLoaderService,
      private translateService: TranslateService,
    ) { }

  ngOnInit(): void {
    debugger
    this.GetSearchFormValues();
  }

  GetSearchFormValues() {
    debugger
    this.voucherTypeList = this.vTypeList;
    this.statusLists = this.vStatusList;
    this.userbranchList = this.vBranchList;
    this.currancyList = this.vcurrencyList;
    this.employeeLists = this.vemployeeList;
    this.paymentMethods = this.vpaymentMethods;
    this.searchCriteria = {
      voucherTypes: '',
      status: 0,
      branchId: 0,
      fromVoucherNo: '',
      toVoucherNo: '',
      currencyId: 0,
      representId: 0,
      fromDate: this.vfromDate ? formatDate(this.vfromDate, "yyyy-MM-dd", "en-US") : '',
      toDate: this.vtoDate ? formatDate(this.vtoDate, "yyyy-MM-dd", "en-US") : '',
      note: '',
      paymentMethodId:'',
    };
  }


  getData() {
    debugger
    this.oldMultiValue = this.searchCriteria.voucherTypes;
    this.oldpaymentMethodId = this.searchCriteria.paymentMethodId;
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
     if (this.searchCriteria.paymentMethodId !== '' && this.searchCriteria.paymentMethodId !== null) {
      if (Array.isArray(this.searchCriteria.paymentMethodId)) {
        this.searchCriteria.paymentMethodId = this.searchCriteria.paymentMethodId.join(',');
      }
    }
    this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
    this.GetEntryVouchersSearchList(this.searchCriteria).subscribe(result => {
      debugger
      

      this.data = result;
      this.searchResultEvent.emit(result);
      this.searchCriteria.voucherTypes = this.oldMultiValue;
      this.searchCriteria.paymentMethodId = this.oldpaymentMethodId;
       this.egretLoader.close();
    },
      (error) => {
        console.error('Error occurred:', error);
         this.egretLoader.close();
      });
  }

  public GetEntryVouchersSearchList(searchCriteria: any): Observable<any> {
    debugger
  
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    if (this.voucherTypeEnum === 5 || this.voucherTypeEnum === 7) {
      return this.http.post<any>(`${environment.apiURL_Main + '/api/ProcessingIncomingCheque/IncomingChequesSearchList/'
        + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + this.voucherTypeEnum} `, JSON.stringify(searchCriteria), httpOptions)
        .pipe(
          catchError(this.handleError)
        )
    }

    else if (this.voucherTypeEnum === 81) {
      return this.http.post<any>(`${environment.apiURL_Main + '/api/SuppliersOpeningBalance/SuppliersOpeningBalanceSearchList/'
        + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + this.voucherTypeEnum} `, JSON.stringify(searchCriteria), httpOptions)
        .pipe(
          catchError(this.handleError)
        )
    }
    else if (this.voucherTypeEnum === 29) {
      return this.http.post<any>(`${environment.apiURL_Main + '/api/BeginningCheques/BeginningChequesSearchList/'
        + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `, JSON.stringify(searchCriteria), httpOptions)
        .pipe(
          catchError(this.handleError)
        )
    }
    else if (this.voucherTypeEnum === 97) {
      return this.http.post<any>(`${environment.apiURL_Main + '/api/CustomersOpeningBalance/CustomersOpeningBalanceSearchList/'
        + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + this.voucherTypeEnum} `, JSON.stringify(searchCriteria), httpOptions)
        .pipe(
          catchError(this.handleError)
        )
    }
    else if (this.voucherTypeEnum === 40) {
      return this.http.post<any>(`${environment.apiURL_Main + '/api/PurchaseRequest/PurchaseRequestSearchList/'
        + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + this.voucherTypeEnum} `, JSON.stringify(searchCriteria), httpOptions)
        .pipe(
          catchError(this.handleError)
        )
    }
    else if (this.voucherTypeEnum === 209) {
      return this.http.post<any>(`${environment.apiURL_Main + '/api/InternalPurReq/PurchaseRequestSearchList/'
        + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + this.voucherTypeEnum} `, JSON.stringify(searchCriteria), httpOptions)
        .pipe(
          catchError(this.handleError)
        )
    }
    else if (this.voucherTypeEnum === 43) {
      return this.http.post<any>(`${environment.apiURL_Main + '/api/SalesRequst/SalesRequestSearchList/'
        + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + this.voucherTypeEnum} `, JSON.stringify(searchCriteria), httpOptions)
        .pipe(
          catchError(this.handleError)
        )
    }
    else if (this.voucherTypeEnum === 41 || this.voucherTypeEnum === 39) {
      return this.http.post<any>(`${environment.apiURL_Main + '/api/PurchaseInvoice/GetPurchaseInvoiceSearchList/'
        + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + this.voucherTypeEnum} `, JSON.stringify(searchCriteria), httpOptions)
        .pipe(
          catchError(this.handleError)
        )
    }
    else if (this.voucherTypeEnum === 38) {
      return this.http.post<any>(`${environment.apiURL_Main + '/api/ReceiptItemsVoucher/GetReceiptItemsVoucherSearchList/'
        + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + this.voucherTypeEnum} `, JSON.stringify(searchCriteria), httpOptions)
        .pipe(
          catchError(this.handleError)
        )
    }
    else if (this.voucherTypeEnum === 21) {
      return this.http.post<any>(`${environment.apiURL_Main + '/api/TransferVoucher/TransferVoucherSearchList/'
        + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + this.voucherTypeEnum} `, JSON.stringify(searchCriteria), httpOptions)
        .pipe(
          catchError(this.handleError)
        )
      // return this.http.post(`${environment.apiURL_Main + '/api/TransferVoucher/TransferVoucherSearchList/'
      // + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()+ '/' + this.voucherTypeEnum} `)
      // .pipe(
      //   catchError(this.handleError)
      // )
    }
    else if (this.voucherTypeEnum === 99) {
      debugger
      return this.http.post<any>(`${environment.apiURL_Main + '/api/AssetPurchaseInvoice/GetPurchaseInvoiceSearchList/'
        + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + this.voucherTypeEnum} `, JSON.stringify(searchCriteria), httpOptions)
        .pipe(
          catchError(this.handleError)
        )
    }
    else if (this.voucherTypeEnum === 102) {
      debugger
      return this.http.post<any>(`${environment.apiURL_Main + '/api/AssetSalesInvoice/GetSalesInvoiceSearchList/'
        + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + this.voucherTypeEnum} `, JSON.stringify(searchCriteria), httpOptions)
        .pipe(
          catchError(this.handleError)
        )
    }
    else if (this.voucherTypeEnum === 107) {
      debugger
      return this.http.post<any>(`${environment.apiURL_Main + '/api/FixedAssetOperation/GetAssetOperationSearchList/'
        + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + this.voucherTypeEnum} `, JSON.stringify(searchCriteria), httpOptions)
        .pipe(
          catchError(this.handleError)
        )
    }
    else if (this.voucherTypeEnum === 32) {
      debugger
      return this.http.post<any>(`${environment.apiURL_Main + '/api/FixedAssetDepreciation/GetDepreciationListBySearch/'
        + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + this.voucherTypeEnum} `, JSON.stringify(searchCriteria), httpOptions)
        .pipe(
          catchError(this.handleError)
        )
    }
/*     else if (this.voucherTypeEnum === 232) {
      debugger
      return this.http.post<any>(`${environment.apiURL_Main + '/api/ServicePurchaseRequestList/PurchaseRequestSearchList/'
        + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + this.voucherTypeEnum} `, JSON.stringify(searchCriteria), httpOptions)
        .pipe(
          catchError(this.handleError)
        )
    } */

    else {
      return this.http.post<any>(`${environment.apiURL_Main + '/api/EntryVouchers/EntryVouchersSearchList/'
        + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + this.voucherTypeEnum} `, JSON.stringify(searchCriteria), httpOptions)
        .pipe(
          catchError(this.handleError)
        )

    }

  }


  public GetAccVouchersList(): Observable<any> {
    debugger
    if (this.voucherTypeEnum === 5) {
      return this.http.get(`${environment.apiURL_Main + '/api/ProcessingIncomingCheque/ProcessingIncomingChequeList/'
        + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
        .pipe(
          catchError(this.handleError)
        )
    }
    else if (this.voucherTypeEnum === 7) {
      return this.http.get(`${environment.apiURL_Main + '/api/ProcessingOutcomingCheque/ProcessingOutgoingChequeList/'
        + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
        .pipe(
          catchError(this.handleError)
        )
    }
    else if (this.voucherTypeEnum === 81) {
      return this.http.get(`${environment.apiURL_Main + '/api/SuppliersOpeningBalance/SuppliersOpeningBalanceList/'
        + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
        .pipe(
          catchError(this.handleError)
        )
    }
    else if (this.voucherTypeEnum === 29) {
      return this.http.get(`${environment.apiURL_Main + '/api/BeginningCheques/BeginningChequesList/'
        + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
        .pipe(
          catchError(this.handleError)
        )
    }
    else if (this.voucherTypeEnum === 97) {
      return this.http.get(`${environment.apiURL_Main + '/api/CustomersOpeningBalance/CustomersOpeningBalanceList/'
        + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
        .pipe(
          catchError(this.handleError)
        )
    }
    else if (this.voucherTypeEnum === 99) {
      debugger
      return this.http.get(`${environment.apiURL_Main + '/api/AssetPurchaseInvoice/SupplierPaymentVoucherList/'
        + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
        .pipe(
          catchError(this.handleError)
        )
    }
    else if (this.voucherTypeEnum === 40) {
      return this.http.get(`${environment.apiURL_Main + '/api/PurchaseRequest/PurchaseRequestList/'
        + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
        .pipe(
          catchError(this.handleError)
        )
    }
    else if (this.voucherTypeEnum === 209) {
      return this.http.get(`${environment.apiURL_Main + '/api/InternalPurReq/PurchaseRequestList/'
        + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
        .pipe(
          catchError(this.handleError)
        )
    }
    else if (this.voucherTypeEnum === 43) {
      return this.http.get(`${environment.apiURL_Main + '/api/SalesRequst/SalesRequstList/'
        + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
        .pipe(
          catchError(this.handleError)
        )
    }
    else if (this.voucherTypeEnum === 39 || this.voucherTypeEnum === 41) {
      return this.http.get(`${environment.apiURL_Main + '/api/PurchaseInvoice/PurchaseInvoiceList/'
        + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + this.voucherTypeEnum} `)
        .pipe(
          catchError(this.handleError)
        )
    }
    else if (this.voucherTypeEnum === 32) {
      debugger
      return this.http.get(`${environment.apiURL_Main + '/api/FixedAssetDepreciation/SupplierPaymentVoucherList/' +
        this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`)
        .pipe(
          catchError(this.handleError)
        )
    }
    else if (this.voucherTypeEnum === 102) {
      debugger
      return this.http.get(`${environment.apiURL_Main + '/api/AssetSalesInvoice/SupplierPaymentVoucherList/'
        + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
        .pipe(
          catchError(this.handleError)
        )
    }
    else if (this.voucherTypeEnum === 107) {
      debugger
      return this.http.get(`${environment.apiURL_Main + '/api/FixedAssetOperation/SupplierPaymentVoucherList/'
        + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
        .pipe(
          catchError(this.handleError)
        )
    }
    else if (this.voucherTypeEnum === 38) {
      return this.http.get(`${environment.apiURL_Main + '/api/ReceiptItemsVoucher/ReceiptItemsVoucherList/'
        + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
        .pipe(
          catchError(this.handleError)
        )
    }
    else if (this.voucherTypeEnum === 44) {
      return this.http.get(`${environment.apiURL_Main + '/api/ServicesInv/ServiceInvoiceList/'
        + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
        .pipe(
          catchError(this.handleError)
        )
    }
    else if (this.voucherTypeEnum === 45) {
      return this.http.get(`${environment.apiURL_Main + '/api/ReturnServiceInvoice/ReturnServiceInvoiceList/'
        + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
        .pipe(
          catchError(this.handleError)
        )
    }
/*     else if (this.voucherTypeEnum === 232) {
      return this.http.get(`${environment.apiURL_Main + '/api/ServicePurchaseRequestList/GetServicePurchaseRequestList/'
        + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
        .pipe(
          catchError(this.handleError)
        )

    } */
    else {
      return this.http.get(`${environment.apiURL_Main + '/api/EntryVouchers/GetAccVouchersList/'
        + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + this.voucherTypeEnum} `)
        .pipe(
          catchError(this.handleError)
        )
    }

  }

  GetMainData() {
    debugger
    this.GetAccVouchersList().subscribe(result => {
      debugger
      this.data = result;
      this.searchResultEvent.emit(result);
    },
      (error) => {
        console.error('Error occurred:', error);
      })
  }




  EmptySearch() {
    debugger
    this.showLoader = true;
    this.searchCriteria.branchId = 0;
    this.searchCriteria.paymentMethodId = '';
    this.searchCriteria.voucherTypes = '';
    this.searchCriteria.status = 0;
    this.searchCriteria.currencyId = 0;
    this.searchCriteria.representId = 0;
    this.searchCriteria.fromVoucherNo = "";
    this.searchCriteria.toVoucherNo = "";
    this.searchCriteria.note = "";
    this.GetSearchFormValues();
    this.GetMainData();
    this.showLoader = false;
    
  }


  // handleVoucherTypesChange(newValue: any) {
  //   debugger
  //   this.searchCriteria.voucherTypes = '';
  //   this.searchCriteria.voucherTypes =newValue;
  //   (onChange)="handleVoucherTypesChange($event)"
  // }


  private handleError(error: HttpErrorResponse) {
    debugger
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
