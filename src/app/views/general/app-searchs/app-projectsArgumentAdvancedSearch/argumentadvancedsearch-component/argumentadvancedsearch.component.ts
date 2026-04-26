import { formatDate } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { AppEntryvouchersService } from 'app/views/app-account/app-entryvouchers/app-entryvouchers.service';
import { environment } from 'environments/environment';
import { catchError, Observable, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
interface AuthData {
  id: any;
  dealName: any;
  dealNo: any;
  authoritieId: any;
  countryId: any;
  fromDate: any;
  toDate: any;
  secondPartyId: any;
  firstPartyId: any;
  userId: any;
  stampFromDate: any;
  stampToDate: any;
}

@Component({
  selector: 'app-argumentadvancedsearch-component',
  templateUrl: './argumentadvancedsearch.component.html',
  styleUrl: './argumentadvancedsearch.component.scss'
})
export class ArgumentadvancedsearchComponent {
  @Output() searchResultEvent: EventEmitter<any> = new EventEmitter();
  @Input() vAuthoritiesList: any;
  @Input() vCountryList: any;
  @Input() vUserList: any;
  @Input() vfromDate: Date;
  @Input() vtoDate: Date;
  @Input() vstampFromDate: Date;
  @Input() vstampToDate: Date;
  authoritieList: any;
  AuthoritiesList: any;
  countryList: any;
  UserList: any;
  searchCriteria: AuthData;
  data: any;
  showLoader: boolean;
  oldMultiValue: string | string[];
  constructor
    (
      private formbulider: FormBuilder,
      private http: HttpClient,
      private jwtAuth: JwtAuthService,
      private appEntryvouchersService: AppEntryvouchersService,
      private translateService: TranslateService,
      private egretLoader: AppLoaderService,
    ) { }

  ngOnInit(): void {
    this.GetSearchFormValues();
  }

  GetSearchFormValues() {
    debugger
    this.AuthoritiesList = this.vAuthoritiesList;
    this.countryList = this.vCountryList;
    this.UserList = this.vUserList;

    this.searchCriteria = {
      id: 0,
      dealName: '',
      dealNo: '',
      authoritieId: 0,
      countryId: 0,
      userId: 0,
      fromDate: this.vfromDate ? formatDate(this.vfromDate, "yyyy-MM-dd", "en-US") : '',
      toDate: this.vtoDate ? formatDate(this.vtoDate, "yyyy-MM-dd", "en-US") : '',
      stampFromDate: this.vstampFromDate ? formatDate(this.vstampFromDate, "yyyy-MM-dd", "en-US") : '',
      stampToDate: this.vstampToDate ? formatDate(this.vstampToDate, "yyyy-MM-dd", "en-US") : '',
      secondPartyId: 0,
      firstPartyId: 0,
    };
  }

  getData() {
    debugger
    this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
    this.GetAgreementsSearchList(this.searchCriteria).subscribe(result => {
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

  public GetAgreementsSearchList(searchCriteria): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/Agreements/GetAgreementsListBySearch/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `, JSON.stringify(searchCriteria), httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetArgumentList(): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/Agreements/GetAgreementsList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  GetMainData() {
    this.GetArgumentList().subscribe(result => {
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
    this.searchCriteria.dealName = '';
    this.searchCriteria.dealNo = '';
    this.searchCriteria.authoritieId = 0;
    this.searchCriteria.countryId = 0;
    this.searchCriteria.userId = 0;
    this.GetSearchFormValues();
    this.GetMainData();
    this.showLoader = false;
    this.searchCriteria.firstPartyId = 0;
    this.searchCriteria.secondPartyId = 0;
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
    //this.loading = false;
  }
}
