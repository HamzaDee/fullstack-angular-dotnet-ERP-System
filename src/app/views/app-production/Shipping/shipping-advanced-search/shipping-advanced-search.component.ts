import { formatDate } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { environment } from 'environments/environment';
import { catchError, Observable, throwError } from 'rxjs';

interface entryVData {
  salesOrder: any;
  agentId: any;
  countryId: any;
  item: any;
  fromDate: any;
  toDate: any;
  year: any;
}

@Component({
  selector: 'app-shipping-advanced-search',
  templateUrl: './shipping-advanced-search.component.html',
  styleUrl: './shipping-advanced-search.component.scss'
})
export class ShippingAdvancedSearchComponent {
  @Output() searchResultEvent: EventEmitter<any> = new EventEmitter();
  @Input() VsalesOrderList: any;
  @Input() VagentsList: any;
  @Input() VcountriesList: any;
  @Input() VAllItemsList: any;
  @Input() vfromdate: Date;
  @Input() vtodate: Date;
  @Input() year: number;

  data: any;
  searchCriteria: entryVData;
  showLoader: boolean;
  countriesList: any;
  agentsList: any;
  salesOrderList: any;
  allItemsList: any;
  allagentList: any;
  AgentId: any;
  constructor
    (private formbulider: FormBuilder,
      private http: HttpClient,
      private jwtAuth: JwtAuthService,) { }

  ngOnInit(): void {
    this.GetSearchFormValues();
  }

  GetSearchFormValues() {
    debugger
    this.salesOrderList = this.VsalesOrderList;
    this.agentsList = this.VagentsList;
    this.countriesList = this.VcountriesList;
    this.allItemsList = this.VAllItemsList;
    this.allagentList = this.VagentsList;
    this.AgentId = -1;
    this.searchCriteria = {
      salesOrder: 0,
      agentId: 0,
      countryId: 0,
      item: 0,
      fromDate: this.vfromdate ? formatDate(this.vfromdate, "yyyy-MM-dd", "en-US") : '',
      toDate: this.vtodate ? formatDate(this.vtodate, "yyyy-MM-dd", "en-US") : '',
      year: 0,
    };
  }

  getData() {
    debugger
    this.searchCriteria.salesOrder ??= 0;
    if(this.searchCriteria.salesOrder =='')
      {
        this.searchCriteria.salesOrder = 0;
      }
    this.searchCriteria.countryId ??= 0;
    if(this.AgentId > 0)
      {
        this.searchCriteria.agentId = this.AgentId
      }
    else
      {
        this.searchCriteria.agentId = 0;
      }
      this.searchCriteria.item ??= 0;
       if(this.searchCriteria.item =='')
      {
        this.searchCriteria.item = 0;
      }
      this.searchCriteria.year ??= 0;
       if(this.searchCriteria.year =='')
      {
        this.searchCriteria.year = 0;
      }
    this.GetInvoiceSalesSearchList(this.searchCriteria).subscribe(result => {
      debugger
      this.data = result;
      this.searchResultEvent.emit(result);
    },
      (error) => {
        console.error('Error occurred:', error);
      });
  }

  public GetInvoiceSalesSearchList(searchCriteria): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    const url = `${environment.apiURL_Main}/api/Shipping/GetShippSearchList/${this.jwtAuth.getLang()}/${this.jwtAuth.getCompanyId()}/${this.jwtAuth.getUserId()}`;
    return this.http.post<any>(url, JSON.stringify(searchCriteria), httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }


  public GetInvoiceSSalesList(): Observable<any> {    
    return this.http.get(`${environment.apiURL_Main + '/api/Shipping/GetShippingList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
    // + + '/' this.voucherTypeEnum
}


GetMainData(){
  debugger
  this.GetInvoiceSSalesList().subscribe(result => {
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
    this.searchCriteria.salesOrder = 0;
    this.searchCriteria.agentId = 0;
    this.searchCriteria.countryId = 0;
    this.searchCriteria.item = 0;
    this.searchCriteria.fromDate = "";
    this.searchCriteria.toDate = "";
    this.searchCriteria.year = 0;
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

  getCustomers(event: any){
    debugger
    const countryId = event.value === undefined ? event : event.value;
    if(countryId == 0)
      this.agentsList = this.allagentList;
    else
      this.agentsList = this.allagentList.filter(c => c.id == countryId || c.id == -1);
  }
}
