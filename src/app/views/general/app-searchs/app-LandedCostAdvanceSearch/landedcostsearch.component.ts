import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup,Validators } from '@angular/forms';
import { formatDate } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { AppEntryvouchersService } from 'app/views/app-account/app-entryvouchers/app-entryvouchers.service';

interface landedCostData 
{
  voucherNo : any;
  supplierId : any;
  fromDate : any;
  toDate : any;
  branchId : any;
  statusId : any; 
}

@Component({
  selector: 'app-landedcostsearch',
  templateUrl: './landedcostsearch.component.html',
  styleUrl: './landedcostsearch.component.scss'
})
export class LandedcostsearchComponent implements OnInit {
  @Input() vSuppliersList: any;
  @Input() vBranchesList: any;
  @Input() vStatusList: any;
  @Output() searchResultEvent: EventEmitter<any> = new EventEmitter();


  suppliersList: any;
  branchesList: any;
  statusList: any;
  searchCriteria: landedCostData;
  data:any;
  date: Date = new Date();
  showLoader:boolean;
  
  constructor
  (
    private formbulider: FormBuilder,
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
    private appEntryvouchersService:AppEntryvouchersService,
  ) { }

   ngOnInit(): void 
  {
    debugger
    this.GetSearchFormValues();
  }

   ngOnChanges(changes: SimpleChanges): void {
    if (changes['vSuppliersList']) this.suppliersList = this.vSuppliersList;
    if (changes['vBranchesList'])   this.branchesList   = this.vBranchesList;
    if (changes['vStatusList'])     this.statusList     = this.vStatusList;
  }

  GetSearchFormValues() {
    debugger
    this.suppliersList = this.vSuppliersList;
    this.branchesList  = this.vBranchesList;
    this.statusList    = this.vStatusList;
    
    this.searchCriteria = {
      voucherNo: '',
      supplierId:0,
      fromDate: formatDate(this.date, 'yyyy-MM-dd', 'en'),
      toDate: formatDate(this.date, 'yyyy-MM-dd', 'en'),
      branchId : 0 ,
      statusId : 0 ,
    };
  }


    getData() {
    debugger    
    this.GetLandedCostListBySearch(this.searchCriteria).subscribe(result => {
      debugger
      this.data = result;
      this.searchResultEvent.emit(result);
    },
      (error) => {
        console.error('Error occurred:', error);
      });
  }  

 public GetLandedCostListBySearch(searchCriteria: any): Observable<any> {
  const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  return this.http.post<any>(`${environment.apiURL_Main + '/api/LandedCost/GetLandedCostListBySearch/'
  + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `, JSON.stringify(searchCriteria), httpOptions)
  .pipe(
    catchError(this.handleError)
  )
}

  
  public GetLandedCostList(): Observable<any> {
    debugger
      return this.http.get(`${environment.apiURL_Main + '/api/LandedCost/GetLandedCostList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      );
  }

  GetMainData()
  {
    debugger
    this.GetLandedCostList().subscribe(result => {
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
    this.searchCriteria.voucherNo = '';
    this.searchCriteria.supplierId = 0;
    this.searchCriteria.fromDate = formatDate(this.date, 'yyyy-MM-dd', 'en');
    this.searchCriteria.toDate = formatDate(this.date, 'yyyy-MM-dd', 'en');
    this.searchCriteria.branchId = 0;
    this.searchCriteria.statusId = 0;
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
