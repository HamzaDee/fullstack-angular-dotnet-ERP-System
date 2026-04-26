import { formatDate } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { environment } from 'environments/environment';
import { catchError, Observable, throwError } from 'rxjs';

interface SalesOrderData {
  id: any;
  sales_No: any;
  v_type: any;
  cus: any;
  countryId: any;
  fromDate: any;
  toDate: any;
  Status: any;
}

@Component({
  selector: 'app-sales-order-search',
  templateUrl: './sales-order-search.component.html',
  styleUrl: './sales-order-search.component.scss'
})
export class SalesOrderSearchComponent {
  @Output() searchResultEvent: EventEmitter<any> = new EventEmitter();
  @Input() VvorderTypeList: any;
  @Input() vcustomersList: any;
  @Input() vcountryList: any;
  @Input() vfromDate: Date;
  @Input() vtoDate: Date;
  orderTypeList: any;
  customersList: any;
  countryList: any;
  searchCriteria: SalesOrderData;
  data: any;
  showLoader: boolean;
  oldMultiValue: string | string[];

 currentLang = this.jwtAuth.getLang();
  StatusList = [
    {id: -1,text: this.currentLang === 'ar' ? 'اختر' : 'Choose' },
    {id: 0,text: this.currentLang === 'ar' ? 'جديد' : 'Saved' },
    { id: 1,text: this.currentLang === 'ar' ? 'ملغي' : 'Canceled' },
    { id: 2,text: this.currentLang === 'ar' ? 'معدل' : 'Edited'},
    { id: 3, text: this.currentLang === 'ar' ? 'معتمد' : 'Approved' }
  ];


  constructor(
      private formbulider: FormBuilder,
      private http: HttpClient,
      private jwtAuth: JwtAuthService,
      private translateService: TranslateService,
      private egretLoader: AppLoaderService,
    ) { }

  ngOnInit(): void {
    this.GetSearchFormValues();
  }

  GetSearchFormValues() {
    debugger
    this.orderTypeList = this.VvorderTypeList;
    this.customersList = this.vcustomersList;
    this.countryList = this.vcountryList;
    this.StatusList = this.StatusList;

    this.searchCriteria = {
      id: 0,
      sales_No: '',
      v_type: -1,
      cus: -1,
      countryId: 0,
      Status: -1,
      fromDate: this.vfromDate ? formatDate(this.vfromDate, "yyyy-MM-dd", "en-US") : '',
      toDate: this.vtoDate ? formatDate(this.vtoDate, "yyyy-MM-dd", "en-US") : '',
    };
  }

  getData() {
    debugger
    this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
    this.GetSalesOrdersSearchList(this.searchCriteria).subscribe(result => {
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

  public GetSalesOrdersSearchList(searchCriteria): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/SalesOrder/GetSalesOrderListBySearch/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `, JSON.stringify(searchCriteria), httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  GetSalesOrdersList(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/SalesOrder/GetSalesOrdersList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  GetMainData() {
    this.GetSalesOrdersList().subscribe(result => {
      this.data = result;
      this.searchResultEvent.emit(result);
    },
      (error) => {
        console.error('Error occurred:', error);
      })
  }

  EmptySearch() {
    this.showLoader = true;
    this.searchCriteria.id = 0;
    this.searchCriteria.sales_No = '';
    this.searchCriteria.v_type = 0;
    this.searchCriteria.cus = 0;
    this.searchCriteria.countryId = 0;
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
