import { formatDate } from '@angular/common';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { AppEntryvouchersService } from 'app/views/app-account/app-entryvouchers/app-entryvouchers.service';
import { environment } from 'environments/environment';
import { Observable, catchError, throwError } from 'rxjs';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { TranslateService } from '@ngx-translate/core';
interface AuthData {
  id: any;
  projectNo: any;
  authoritieId: any;
  countryId: any;
  projShortName: any;
  inJordan: any;
  outJordan: any;
  financingMethodId: any;
  liaisonOfficerId: any;
  projectStatusId: any;
  projImplTypeId: any;
}

@Component({
  selector: 'app-app-project-definition-advanced-search',
  templateUrl: './app-project-definition-advanced-search.component.html',
  styleUrl: './app-project-definition-advanced-search.component.scss'
})
export class AppProjectDefinitionAdvancedSearchComponent {
  @Output() searchResultEvent: EventEmitter<any> = new EventEmitter();
  searchCriteria: AuthData;
  data: any;
  showLoader: boolean;
  oldMultiValue: string | string[];
  loading: boolean ;
  @Input() vAuthoritiesList: any;
  @Input() vCountryList: any;
  @Input() vfinancialMethodList: any;
  @Input() vprojectOfficerList: any;
  @Input() vprojectStatusList: any;
  @Input() vprojectImpTypeList: any;


  public authoritieList: any;
  public countryList: any;
  public financialMethodList: any;
  public projectOfficerList: any;
  public projectStatusList: any; 
  public projectImpTypeList: any;

  constructor
              (
                private formbulider: FormBuilder,
                private http: HttpClient,
                private jwtAuth: JwtAuthService,
                private appEntryvouchersService: AppEntryvouchersService,
                private egretLoader: AppLoaderService,
                private translateService: TranslateService,

              ) { }

  ngOnInit(): void {
    this.GetSearchFormValues();
  }

  GetSearchFormValues() {
    debugger
    this.authoritieList = this.vAuthoritiesList;
    this.countryList = this.vCountryList;
    this.financialMethodList = this.vfinancialMethodList;
    this.projectOfficerList = this.vprojectOfficerList;
    this.projectStatusList = this.vprojectStatusList;
    this.projectImpTypeList = this.vprojectImpTypeList;


    this.searchCriteria = {
      id: 0,
      projectNo: 0,
      authoritieId: 0,
      countryId: 0,
      projShortName: '',
      inJordan: false,
      outJordan: false,
      financingMethodId: 0,
      liaisonOfficerId: 0,
      projectStatusId: 0,
      projImplTypeId: 0,
    };
  }

  getData() {
    debugger 

      this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
      this.GetGetProjectDefinitionSearchList(this.searchCriteria).subscribe(result => {
      this.data = result;
      this.searchResultEvent.emit(result);
      this.egretLoader.close();
    },
      (error) => {
        console.error('Error occurred:', error);
        this.egretLoader.close();
      });
  }

  public GetGetProjectDefinitionSearchList(searchCriteria): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/ProjectDefinition/GetProjectDefinitionListBySearch/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `, JSON.stringify(searchCriteria), httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetProjectDefinitionList(): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/ProjectDefinition/GetProjectsList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  GetMainData() {
    this.GetProjectDefinitionList().subscribe(result => {
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
    this.searchCriteria.projectNo = 0;
    this.searchCriteria.authoritieId = 0;
    this.searchCriteria.countryId = 0;
    this.searchCriteria.projShortName = '';
    this.searchCriteria.inJordan = false;
    this.searchCriteria.outJordan = false;
    this.searchCriteria.financingMethodId = 0;
    this.searchCriteria.liaisonOfficerId = 0;
    this.searchCriteria.projectStatusId = 0;
    this.searchCriteria.projImplTypeId = 0;
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


  AuthloadLazyOptions(event: any) {
    const { first, last } = event;

    // Don't replace the full list; copy and fill only the needed range
    if (!this.authoritieList) {
      this.authoritieList = [];
    }

    // Make sure the array is large enough
    while (this.authoritieList.length < last) {
      this.authoritieList.push(null);
    }

    for (let i = first; i < last; i++) {
      this.authoritieList[i] = this.authoritieList[i];
    }

    this.loading = false;
  }

}
