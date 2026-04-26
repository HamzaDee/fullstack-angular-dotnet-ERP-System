import { formatDate } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { environment } from 'environments/environment';
import { catchError, Observable, throwError } from 'rxjs';

interface entryVData {
  countryId: any;
  agentId: any;
  fYear: any;
}

@Component({
  selector: 'app-production-search-form',
  templateUrl: './production-search-form.component.html',
  styleUrl: './production-search-form.component.scss'
})
export class ProductionSearchFormComponent {
  @Output() searchResultEvent: EventEmitter<any> = new EventEmitter();
  @Input() vCountryList : any; 
  @Input() vAgentList : any; 
  @Input() vFYear : number; 
  showLoader: boolean;
  countryList: any;
  agentList: any;
  allagentList: any;
  searchCriteria: entryVData;
  data: any;
  AgentId: any;
  constructor(
    private formbulider: FormBuilder,
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }

  ngOnInit(): void { 
    this.GetSearchFormValues();
  }

  GetSearchFormValues() {
    debugger
    this.countryList = this.vCountryList;
    this.agentList = this.vAgentList;
    this.allagentList = this.vAgentList;
    this.AgentId = -1;
    this.searchCriteria = {
      countryId:0,
      agentId:'' ,
      fYear: '',
    };
  }  

  getCustomers(event: any){
    debugger
    const countryId = event.value === undefined ? event : event.value;
    if(countryId == 0)
      this.agentList = this.allagentList;
    else
      this.agentList = this.allagentList.filter(c => c.id == countryId || c.id == -1);
  }

  getData() {
    debugger
    this.searchCriteria.fYear ??= 0;
    if(this.searchCriteria.fYear =='')
      {
        this.searchCriteria.fYear = 0;
      }
    this.searchCriteria.countryId ??= 0;
    if(this.AgentId > 0)
      {
        this.searchCriteria.agentId = this.AgentId;
        // this.searchCriteria.agentId = Number(this.searchCriteria.agentId);
      }
    else
      {
        this.searchCriteria.agentId = 0;
      }
    this.getProductionListBySearch(this.searchCriteria).subscribe(result => {
      debugger
      this.data = result;
      this.searchResultEvent.emit(result);
    },
      (error) => {
        console.error('Error occurred:', error);
      });
  }

  public getProductionListBySearch(searchCriteria): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    const url = `${environment.apiURL_Main}/api/Forecasting/GetProductionListBySearch/${this.jwtAuth.getLang()}/${this.jwtAuth.getCompanyId()}/${this.jwtAuth.getUserId()}`;
    return this.http.post<any>(url, JSON.stringify(searchCriteria), httpOptions)

      .pipe(
        catchError(this.handleError)
      );
  }

  public GetForecastingList(): Observable<any> {    
    return this.http.get(`${environment.apiURL_Main + '/api/Forecasting/GetForecastingList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
}

GetMainData(){
  debugger
  this.GetForecastingList().subscribe(result => {
    debugger
    this.data = result;
    this.searchResultEvent.emit(result);
  },
  (error) => {
    console.error('Error occurred:', error);
  })
}

  EmptySearch() {
    this.showLoader = true;
    this.agentList = this.allagentList;
    this.searchCriteria.countryId = 0;
    this.searchCriteria.agentId = 0;
    this.searchCriteria.fYear = 0;
    this.AgentId = -1;
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



