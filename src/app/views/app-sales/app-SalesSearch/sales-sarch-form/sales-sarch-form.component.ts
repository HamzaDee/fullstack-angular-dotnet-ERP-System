import { formatDate } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { environment } from 'environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
// import { SalesInvoicesService } from '../../SalesInvoices/sales-invoices.service';

interface entryVData 
{
  voucherTypes : string | string[];
  status:any;
  branchId:any;
  fromVoucherNo:any;
  toVoucherNo:any;
  fromDate:any;
  toDate:any;
  note:any;
  dealerId:any;
}

@Component({
  selector: 'app-sales-sarch-form',
  templateUrl: './sales-sarch-form.component.html',
  styleUrls: ['./sales-sarch-form.component.scss']
})
export class SalesSarchFormComponent implements OnInit {
  @Output() searchResultEvent: EventEmitter<any> = new EventEmitter();

  @Input() vTypeList : any; 
  @Input() vStatusList : any; 
  @Input() vBranchList : any; 
  @Input() vfromVoucherNo : string; 
  @Input() vtoVoucherNo : string; 
  @Input() vfromDate : Date; 
  @Input() vtoDate : Date; 
  @Input() vnote : string; 
  @Input() voucherTypeEnum : any; 
  @Input() vcustomersList : any; 
  
  voucherTypeList:any;
  userbranchList:any;
  statusLists:any;
  searchCriteria: entryVData;
  data:any;
  showLoader: boolean;
  oldMultiValue:string | string[];
  customersList: any;
  
  constructor
          (
            private formbulider: FormBuilder,
            private http: HttpClient,
            private jwtAuth: JwtAuthService,
            // private salesInvoicesService:SalesInvoicesService,
          ) { }

  ngOnInit(): void {
    this.GetSearchFormValues();
  }


  GetSearchFormValues() {
    debugger
    this.voucherTypeList = this.vTypeList;
    this.statusLists = this.vStatusList;
    this.userbranchList= this.vBranchList;    
    this.customersList= this.vcustomersList;    

    this.searchCriteria = {
      voucherTypes: '',
      status: 0,
      branchId: 0,
      fromVoucherNo: '',
      toVoucherNo: '',
      fromDate: this.vfromDate ? formatDate(this.vfromDate, "yyyy-MM-dd", "en-US") : '',
      toDate: this.vtoDate ? formatDate(this.vtoDate, "yyyy-MM-dd", "en-US") : '',
      note: '',      
      dealerId: 0
    };
  }
  

  getData() {
    debugger  
    this.oldMultiValue = this.searchCriteria.voucherTypes;    
    if(this.searchCriteria.voucherTypes == '')
    {
      this.searchCriteria.voucherTypes = null;
    } 
    if(this.searchCriteria.voucherTypes !== '' && this.searchCriteria.voucherTypes !== null)
    {
      if (Array.isArray(this.searchCriteria.voucherTypes)) {
        this.searchCriteria.voucherTypes = this.searchCriteria.voucherTypes.join(',');
      }
    }
    if(this.searchCriteria.fromVoucherNo == '')
    {
      this.searchCriteria.fromVoucherNo = null;
    } 
    if(this.searchCriteria.dealerId == 0 || this.searchCriteria.dealerId == null || this.searchCriteria.dealerId == undefined)
      {
        this.searchCriteria.dealerId == null;
      } 
    if(this.searchCriteria.branchId == 0 || this.searchCriteria.branchId == null || this.searchCriteria.branchId == undefined)
      {
        this.searchCriteria.branchId == null;
      }
    if(this.searchCriteria.toVoucherNo == '')
    {
      this.searchCriteria.toVoucherNo = null;
    }
    if(this.searchCriteria.voucherTypes == '')
    {
      this.searchCriteria.voucherTypes = null;
    } 
    if(this.searchCriteria.note == '')
    {
      this.searchCriteria.note = null;
    } 
    this.GetInvoiceSalesSearchList(this.searchCriteria).subscribe(result => {      
      debugger       
        this.data = result; 
        this.searchResultEvent.emit(result);
        this.searchCriteria.voucherTypes=this.oldMultiValue;
      },
      (error) => {
        console.error('Error occurred:', error);
      });    
  }
  
  public GetInvoiceSalesSearchList(searchCriteria): Observable<any> {
    debugger
    if(this.voucherTypeEnum == 39 || this.voucherTypeEnum == 45)
      {
        const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }; 
        const url = `${environment.apiURL_Main}/api/PurchaseInvoice/GetPurchaseInvoiceSearchList/${this.jwtAuth.getLang()}/${this.jwtAuth.getCompanyId()}/${this.jwtAuth.getUserId()}/${this.voucherTypeEnum}`;
        return this.http.post<any>(url, JSON.stringify(searchCriteria), httpOptions)
       .pipe(
          catchError(this.handleError)
       ); 
      }
      else if(this.voucherTypeEnum == 44)
        {
          const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }; 
          const url = `${environment.apiURL_Main}/api/SalesInvoice/GetSalesInvoiceSearchList/${this.jwtAuth.getLang()}/${this.jwtAuth.getCompanyId()}/${this.jwtAuth.getUserId()}/${this.voucherTypeEnum}`;
          return this.http.post<any>(url, JSON.stringify(searchCriteria), httpOptions)
         .pipe(
            catchError(this.handleError)
         );
        }
 
  }

  
  public GetInvoiceSSalesList(): Observable<any> {    
      return this.http.get(`${environment.apiURL_Main + '/api/PurchaseInvoice/PurchaseInvoiceList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' +  this.voucherTypeEnum} `)
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
    this.searchCriteria.branchId = 0;
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
