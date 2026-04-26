import { formatDate } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { AppEntryvouchersService } from 'app/views/app-account/app-entryvouchers/app-entryvouchers.service';
import { environment } from 'environments/environment';
import { catchError, Observable, throwError } from 'rxjs';


interface ServicePurchaseData {
  voucherTypes: string | string[];
  supplierId: any;
  fromDate: any;
  toDate: any;
  branchId: any;
  Status: any;
}

@Component({
  selector: 'app-service-purchase-search',
  templateUrl: './service-purchase-search.component.html',
  styleUrl: './service-purchase-search.component.scss'
})
export class ServicePurchaseSearchComponent {
  @Input() vTypeList: any;
  @Input() vSuppliersList: any;
  @Input() vBranchesList: any;
  @Input() vStatusList: any;
  @Output() searchResultEvent: EventEmitter<any> = new EventEmitter();
  @Input() voucherTypeEnum: any;
  oldMultiValue: string | string[];


  voucherTypeList: any;
  suppliersList: any;
  branchesList: any;
  statusList: any;
  searchCriteria: ServicePurchaseData;
  data: any;
  date: Date = new Date();
  showLoader: boolean;


  constructor
    (
      private formbulider: FormBuilder,
      private http: HttpClient,
      private jwtAuth: JwtAuthService,
      private appEntryvouchersService: AppEntryvouchersService,
    ) { }

  ngOnInit(): void {
    debugger
    this.GetSearchFormValues();
  }

  GetSearchFormValues() {
    debugger
    this.voucherTypeList = this.vTypeList;
    this.suppliersList = this.vSuppliersList;
    this.branchesList = this.vBranchesList;
    this.statusList = this.vStatusList;

    this.searchCriteria = {
      voucherTypes: '',
      supplierId: 0,
      fromDate: formatDate(this.date, 'yyyy-MM-dd', 'en'),
      toDate: formatDate(this.date, 'yyyy-MM-dd', 'en'),
      branchId: 0,
      Status: 0,
    };
  }

  getData() {
    debugger
    this.oldMultiValue = this.searchCriteria.voucherTypes;

    if (this.searchCriteria.voucherTypes == '') {
      this.searchCriteria.voucherTypes = null;
    }

    if (this.searchCriteria.voucherTypes !== '' && this.searchCriteria.voucherTypes !== null) {
      if (Array.isArray(this.searchCriteria.voucherTypes)) {
        this.searchCriteria.voucherTypes = this.searchCriteria.voucherTypes.join(',');
      }
    }

    this.GetLandedCostListBySearch(this.searchCriteria).subscribe(result => {
      debugger
      this.data = result;
      this.searchCriteria.voucherTypes = this.oldMultiValue;
      this.searchResultEvent.emit(result);
    },
      (error) => {
        console.error('Error occurred:', error);
      });
  }

  public GetLandedCostListBySearch(searchCriteria: any): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    this.voucherTypeEnum = 232;
    return this.http.post<any>(`${environment.apiURL_Main + '/api/ServicePurchaseRequestList/PurchaseRequestSearchList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + this.voucherTypeEnum} `, JSON.stringify(searchCriteria), httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetServicePurchaseList(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/ServicePurchaseRequestList/GetServicePurchaseRequestList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  GetMainData() {
    debugger
    this.GetServicePurchaseList().subscribe(result => {
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
    this.searchCriteria.voucherTypes = '';
    this.searchCriteria.supplierId = 0;
    this.searchCriteria.fromDate = formatDate(this.date, 'yyyy-MM-dd', 'en');
    this.searchCriteria.toDate = formatDate(this.date, 'yyyy-MM-dd', 'en');
    this.searchCriteria.branchId = 0;
    this.searchCriteria.Status = 0;
    this.GetSearchFormValues();
    this.GetMainData();
    this.showLoader = false;
  }

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
