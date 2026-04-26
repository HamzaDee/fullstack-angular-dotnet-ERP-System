import { formatDate } from '@angular/common';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Component,OnInit, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { AppEntryvouchersService } from 'app/views/app-account/app-entryvouchers/app-entryvouchers.service';
import { environment } from 'environments/environment';
import { Observable, catchError, throwError } from 'rxjs';

interface LeadData {
  fromDate: any;
  toDate: any;
  branchId: any;
  inRequest: any;
  requesttype:any;
  areaId: any;
  technicianId: any;
  customerId: any;
  status: any;
}

@Component({
  selector: 'app-app-maintenance-requests-search',
  templateUrl: './app-maintenance-requests-search.component.html',
  styleUrl: './app-maintenance-requests-search.component.scss'
})
export class AppMaintenanceRequestsSearchComponent implements OnInit{
  @Output() searchResultEvent: EventEmitter<any> = new EventEmitter();
  searchCriteria: LeadData;
  data: any;
  showLoader: boolean;
  oldMultiValue: string | string[];
  @Input() vBranchList: any;
  @Input() vAreaList: any;
  @Input() vTechnicianList: any;
  @Input() vSuppliersList: any;
  @Input() vDamageLis: any;
  @Input() vPriorityList: any;
  @Input() vfromDate: Date;
  @Input() vtoDate: Date;
  @Input() vStatusList: Date;
  BranchList: any;
  AreaList: any;
  TechnicianList: any;
  SuppliersList: any;
  DamageList: any;
  PriorityList: any;
  StatusList: any;
  CustomerTypes: { id: number; text: string }[] = [
    { id: 1, text: this.jwtAuth.getLang() === 'ar' ? ' داخلي' : 'Internal' },
    { id: 0, text: this.jwtAuth.getLang() === 'ar' ? 'خارجي' : 'External' },
    { id: -1, text: this.jwtAuth.getLang() === 'ar' ? 'أختر' : 'Select One' },
  ];

  constructor(
    private readonly formbulider: FormBuilder,
    private readonly http: HttpClient,
    private readonly jwtAuth: JwtAuthService,
    private readonly appEntryvouchersService: AppEntryvouchersService,
    private readonly translateService: TranslateService,
    private readonly egretLoader: AppLoaderService,
  ) { }

  ngOnInit(): void {
    this.GetSearchFormValues();
  }

  GetSearchFormValues() {
    debugger
    this.BranchList = this.vBranchList;
    this.AreaList = this.vAreaList;
    this.TechnicianList = this.vTechnicianList;
    this.SuppliersList = this.vSuppliersList;
    this.DamageList = this.vDamageLis;
    this.PriorityList = this.vPriorityList;
    this.StatusList = this.vStatusList;

    this.searchCriteria = {
      fromDate: this.vfromDate ? formatDate(this.vfromDate, "yyyy-MM-dd", "en-US") : '',
      toDate: this.vtoDate ? formatDate(this.vtoDate, "yyyy-MM-dd", "en-US") : '',
      branchId: 0,
      inRequest: 0,
      requesttype:-1,
      areaId: 0,
      technicianId: 0,
      customerId: 0,
      status: 0,
    };
  }

  getData() {
    debugger
    this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
    this.GetMaintenanceRequestsBySearch(this.searchCriteria).subscribe(result => {
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

  public GetMaintenanceRequestsBySearch(searchCriteria): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/MaintenanceRequests/GetMaintenanceRequestsBySearch/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `, JSON.stringify(searchCriteria), httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetMaintenanceRequestsList(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/MaintenanceRequests/GetMaintenanceRequestsList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  GetMainData() {
    this.GetMaintenanceRequestsList().subscribe(result => {
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
    this.searchCriteria.inRequest = 0;
    this.searchCriteria.areaId = 0;
    this.searchCriteria.technicianId = 0;
    this.searchCriteria.customerId = 0;
    this.searchCriteria.status = 0;
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
