import { Component, OnInit, ViewChild ,Input,EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup,Validators } from '@angular/forms';
import { formatDate } from '@angular/common';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';

interface entryVData 
{
  billNo:any;
  agentId:any;
  countryId:any; 
  fromdate:any;
  todate:any;
}

@Component({
  selector: 'app-marsalesinvoiceadvancesearch',
  templateUrl: './marsalesinvoiceadvancesearch.component.html',
  styleUrl: './marsalesinvoiceadvancesearch.component.scss'
})
export class MarsalesinvoiceadvancesearchComponent {
  @Output() searchResultEvent: EventEmitter<any> = new EventEmitter();
  @Input() vagentsList : any; 
  @Input() vcountryList : any; 
  @Input() vbillNo: any; 
  @Input() vfromdate : any; 
  @Input() vtodate : any; 
  agentsList:any
  countrylist:any
  allagentList: any;
  billNo:any
  fromdate:any;
  todate:any;
  searchCriteria: entryVData;
  data:any;
  showLoader: boolean;
  

  constructor
  ( 
    private formbulider: FormBuilder,
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
    // private service:PromotionOrdersService,  
  ) { }

  ngOnInit(): void 
  {
    this.GetSearchFormValues();
  }

  GetSearchFormValues() {
    debugger
    this.agentsList = this.vagentsList;
    this.countrylist = this.vcountryList;
    this.allagentList = this.vagentsList;
    this.fromdate = this.vfromdate;
    this.todate = this.vtodate;
    this.billNo =  this.vbillNo;
    this.searchCriteria = {
      fromdate:this.vfromdate ? formatDate(this.vfromdate, "yyyy-MM-dd", "en-US") : '',
      todate:this.vtodate ? formatDate(this.vtodate, "yyyy-MM-dd", "en-US") : '',
      billNo:'',
      agentId: '',
      countryId: 0,
    };
  }


  getData() {
      debugger
    // this.oldMultiValue = this.searchCriteria.voucherTypes;    
    if(this.searchCriteria.fromdate == '' || this.searchCriteria.fromdate == null || this.searchCriteria.fromdate == undefined )
    {
      this.searchCriteria.fromdate = "";
    } 
    if(this.searchCriteria.todate == '' || this.searchCriteria.todate == null || this.searchCriteria.todate == undefined )
    {
      this.searchCriteria.todate = "";
    } 
    if(this.searchCriteria.billNo == '' || this.searchCriteria.billNo == null || this.searchCriteria.billNo == undefined )
    {
      this.searchCriteria.billNo = "";
    } 
    if(this.searchCriteria.agentId == '' || this.searchCriteria.agentId == null || this.searchCriteria.agentId == undefined)
    {
      this.searchCriteria.agentId = 0;
    } 
    if(this.searchCriteria.countryId == ''|| this.searchCriteria.countryId == null || this.searchCriteria.countryId == undefined)
    {
      this.searchCriteria.countryId = 0;
    }
    
    this.GetMarketSalesInvoiceSearchList(this.searchCriteria).subscribe(result => {      
             
        this.data = result; 
        this.searchResultEvent.emit(result);
      },
      (error) => {
        console.error('Error occurred:', error);
      });    
  }
  
  public GetMarketSalesInvoiceSearchList(searchCriteria): Observable<any> {
    debugger
        const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }; 
        const url = `${environment.apiURL_Main}/api/MarketSalesInvoice/GetMarketSalesInvoiceSearchList/${this.jwtAuth.getLang()}/${this.jwtAuth.getCompanyId()}/${this.jwtAuth.getUserId()}`;
        return this.http.post<any>(url, JSON.stringify(searchCriteria), httpOptions)
        .pipe(
        catchError(this.handleError)
      ); 
        
  }

  public GetMainListMarketSalesInvoice(): Observable<any> {    
    debugger

      return this.http.get(`${environment.apiURL_Main + '/api/MarketSalesInvoice/GetMarketSalesInvoiceList/'
        + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
        .pipe(
          catchError(this.handleError)
        )    
  }

  GetMainData()
  {
    debugger
    this.GetMainListMarketSalesInvoice().subscribe(result => {
      
      this.data = result;
      this.searchResultEvent.emit(result);
    },
    (error) => {
      console.error('Error occurred:', error);
    })
  }

  EmptySearch() { 
    this.showLoader = true;    
    this.searchCriteria.agentId = 0;
    this.searchCriteria.billNo = '';
    this.searchCriteria.fromdate = '';
    this.searchCriteria.todate = '';
    this.searchCriteria.countryId = 0;
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
