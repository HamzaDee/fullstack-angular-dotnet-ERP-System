import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { AppEntryvouchersService } from 'app/views/app-account/app-entryvouchers/app-entryvouchers.service';
import { environment } from 'environments/environment';
import { Observable, catchError, throwError } from 'rxjs';



interface AuthData {
  id: any;
  projectPlanNo: any;
  projectId: any;
  fromDate: any;
  toDate: any;
  distAuthoritiesIds: any;
  representativeId: any;
}

@Component({
  selector: 'app-projectplanadvancedsearch',
  templateUrl: './projectplanadvancedsearch.component.html',
  styleUrl: './projectplanadvancedsearch.component.scss'
})
export class ProjectplanadvancedsearchComponent {
 @Output() searchResultEvent: EventEmitter<any> = new EventEmitter();
  searchCriteria: AuthData;
  data: any;
  showLoader: boolean;
  oldMultiValue: string | string[];
  loading: boolean;
  distIds: any;
  @Input() vAuthoritiesList: any;
  @Input() vProjectsList: any;
  @Input() vEmployeeList: any;
  @Input() vDistSiteDirectionList: any;
  @Input() VFromDate: any;
  @Input() VToDate: any;
  projectsList: any;
  employeeList: any;
  distSiteDirectionList: any;


    constructor
              (
                private formbulider: FormBuilder,
                private http: HttpClient,
                private jwtAuth: JwtAuthService,
                private appEntryvouchersService: AppEntryvouchersService,
              ) { }

  ngOnInit(): void {
    this.GetSearchFormValues();
  }

  GetSearchFormValues() {
    debugger
    this.projectsList = this.vProjectsList;
    this.employeeList = this.vEmployeeList;
    this.distSiteDirectionList = this.vDistSiteDirectionList;

    this.searchCriteria = {
      id: 0,
      projectPlanNo: 0,
      projectId: 0,
      fromDate: this.VFromDate,
      toDate: this.VToDate,
      distAuthoritiesIds: '',
      representativeId: 0,     
    };
  }

  getData() {
    debugger
    if (Array.isArray(this.distIds)) {
      this.searchCriteria.distAuthoritiesIds = this.distIds.join(',');
    }
   else {
    this.searchCriteria.distAuthoritiesIds = '';
  }
    this.GetProjectPlanSearchList(this.searchCriteria).subscribe(result => {
      this.data = result;
      this.searchResultEvent.emit(result);
    },
      (error) => {
        console.error('Error occurred:', error);
      });
  }

  public GetProjectPlanSearchList(searchCriteria): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/ProjectsPlans/GetProjectsPlansListBySearch/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `, JSON.stringify(searchCriteria), httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetProjectsPlansList(): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/ProjectsPlans/GetProjectsPlansList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  GetMainData() {
    this.GetProjectsPlansList().subscribe(result => {
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
    this.searchCriteria.projectPlanNo = 0;
    this.searchCriteria.projectId = 0;
    this.searchCriteria.fromDate = '';
    this.searchCriteria.toDate = '';
    this.distIds= '';
    this.searchCriteria.distAuthoritiesIds = '';
    this.searchCriteria.representativeId = 0;
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

  loadLazyOptions(event: any) {
    const { first, last } = event;

    // Don't replace the full list; copy and fill only the needed range
    if (!this.projectsList) {
      this.projectsList = [];
    }

    // Make sure the array is large enough
    while (this.projectsList.length < last) {
      this.projectsList.push(null);
    }

    for (let i = first; i < last; i++) {
      this.projectsList[i] = this.projectsList[i];
    }

    this.loading = false;
  }

  AuthloadLazyOptions(event: any) {
    const { first, last } = event;

    // Don't replace the full list; copy and fill only the needed range
    if (!this.distSiteDirectionList) {
      this.distSiteDirectionList = [];
    }

    // Make sure the array is large enough
    while (this.distSiteDirectionList.length < last) {
      this.distSiteDirectionList.push(null);
    }

    for (let i = first; i < last; i++) {
      this.distSiteDirectionList[i] = this.distSiteDirectionList[i];
    }

    this.loading = false;
  }
}
