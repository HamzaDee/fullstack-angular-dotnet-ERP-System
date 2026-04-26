import { Component,Input,EventEmitter, Output } from '@angular/core';
import { FormBuilder} from '@angular/forms';
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { AppEntryvouchersService } from 'app/views/app-account/app-entryvouchers/app-entryvouchers.service';
import { formatDate } from '@angular/common';

interface AuthData 
{
  fromOrderNo : any;
  toOrderNo : any;
  fromdate : any;
  todate : any;
  status : any;
  orderId: any;
  maintType : any;
  priority : any;
}

@Component({
  selector: 'app-maintadvancedsearch',
  templateUrl: './maintadvancedsearch.component.html',
  styleUrl: './maintadvancedsearch.component.scss'
})
export class MaintadvancedsearchComponent {
    @Output() searchResultEvent: EventEmitter<any> = new EventEmitter();
    @Input() vStatusList : any; 
    @Input() vRequestOrdersList: any; 
    @Input() vMaintTypesList : any; 
    @Input() vPrioritiesList : any; 
  
  
    statusList:any;
    requestOrdersList:any;
    maintTypesList:any;
    prioritiesList:any;
    loading: boolean;
    searchCriteria: AuthData;
    data:any;
    showLoader: boolean;

    
    constructor
    (
      private formbulider: FormBuilder,
      private http: HttpClient,
      private jwtAuth: JwtAuthService,
      private appEntryvouchersService:AppEntryvouchersService,
    ) { }
  
     ngOnInit(): void 
    {debugger
      this.GetSearchFormValues();
    }
  
    GetSearchFormValues() {
      debugger
      const date = new Date();
      this.statusList = this.vStatusList;
      this.requestOrdersList = this.vRequestOrdersList;
      this.maintTypesList= this.vMaintTypesList;    
      this.prioritiesList = this.vPrioritiesList;
      this.searchCriteria = {
        fromOrderNo:0,
        toOrderNo:0,
        fromdate: formatDate(date, "yyyy-MM-dd", "en-US"),
        todate: formatDate(date, "yyyy-MM-dd", "en-US"),
        status:0,
        orderId:0,
        maintType:0,
        priority:0,
      };
    }
    

    getData() {
      debugger      
      this.GetMaintenanceOrdersListBySearch(this.searchCriteria).subscribe(result => {      
        debugger       
          this.data = result; 
          this.searchResultEvent.emit(result);
        },
        (error) => {
          console.error('Error occurred:', error);
        });    
    }
    
    public GetMaintenanceOrdersListBySearch(searchCriteria): Observable<any> {
      debugger
      const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
        return this.http.post<any>(`${environment.apiURL_Main + '/api/MaintenanceOrder/GetMaintenanceOrdersListBySearch/'
      + this.jwtAuth.getLang() + '/'  + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() } `,JSON.stringify(searchCriteria),httpOptions)
        .pipe(
          catchError(this.handleError)
        )
    }
  
    public GetMaintenanceOrdersList(): Observable<any> {
      debugger
        return this.http.get(`${environment.apiURL_Main + '/api/MaintenanceOrder/GetMaintenanceOrdersList/'
        + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
        .pipe(
          catchError(this.handleError)
        ) 
    }
  
    GetMainData()
    {
      debugger
      this.GetMaintenanceOrdersList().subscribe(result => {
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
      this.searchCriteria.fromOrderNo = 0;
      this.searchCriteria.toOrderNo = 0;
      this.searchCriteria.fromdate = 0;
      this.searchCriteria.todate = 0;
      this.searchCriteria.status = 0;   
      this.searchCriteria.maintType = 0; 
      this.searchCriteria.priority = 0;     
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
